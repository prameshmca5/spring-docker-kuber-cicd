#!/bin/bash
# =============================================================================
#  health-check.sh — Automated System Health Monitor
#  Checks all Kubernetes pods, scans for errors, and sends alerts
#
#  Usage:
#    ./health-check.sh                   # manual one-time check
#    ./health-check.sh --watch           # continuous mode (every 60s)
#    ./health-check.sh --slack-alert     # send Slack alert on failures
#
#  Setup (optional):
#    export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ"
#    export ALERT_EMAIL="yourname@example.com"
# =============================================================================
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
NAMESPACES=("backend" "frontend" "monitoring" "external-tools")
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
LOG_FILE="/tmp/health-check-$(date +%Y%m%d).log"
WATCH_INTERVAL="${WATCH_INTERVAL:-60}"
FAILED_PODS=()
ERROR_LOGS=()

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ─── Helpers ─────────────────────────────────────────────────────────────────
log()      { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"; }
success()  { echo -e "${GREEN}  ✔ $*${NC}"; log "[OK]    $*"; }
warning()  { echo -e "${YELLOW}  ⚠ $*${NC}"; log "[WARN]  $*"; }
error()    { echo -e "${RED}  ✘ $*${NC}";  log "[ERROR] $*"; }
info()     { echo -e "${CYAN}  ℹ $*${NC}"; }
header()   { echo -e "\n${BOLD}${BLUE}═══ $* ${NC}"; }

check_kubectl() {
    if ! command -v kubectl &>/dev/null; then
        error "kubectl not found. Cannot run health check."
        exit 1
    fi
}

# ─── 1. Pod Status Check ─────────────────────────────────────────────────────
check_pods() {
    header "Pod Status Check"
    for NS in "${NAMESPACES[@]}"; do
        echo -e "\n  ${BOLD}Namespace: $NS${NC}"

        # Check if namespace exists
        if ! kubectl get namespace "$NS" &>/dev/null; then
            warning "Namespace '$NS' does not exist — skipping."
            continue
        fi

        local pods
        pods=$(kubectl get pods -n "$NS" --no-headers 2>/dev/null || echo "")

        if [ -z "$pods" ]; then
            info "No pods in namespace '$NS'"
            continue
        fi

        while IFS= read -r line; do
            local name status ready restarts
            name=$(echo "$line" | awk '{print $1}')
            ready=$(echo "$line" | awk '{print $2}')
            status=$(echo "$line" | awk '{print $3}')
            restarts=$(echo "$line" | awk '{print $4}')

            case "$status" in
                Running)
                    if [[ "$restarts" -gt 5 ]]; then
                        warning "Pod $name is Running but has $restarts restarts!"
                        FAILED_PODS+=("$NS/$name: Running but $restarts restarts")
                    else
                        success "Pod $name ($ready) — Restarts: $restarts"
                    fi
                    ;;
                Completed) success "Pod $name — Completed ✓" ;;
                *)
                    error "Pod $name — STATUS: $status (Restarts: $restarts)"
                    FAILED_PODS+=("$NS/$name: $status")
                    ;;
            esac
        done <<< "$pods"
    done
}

# ─── 2. Kubernetes Events (Warnings) ─────────────────────────────────────────
check_events() {
    header "Recent Warning Events (last 30 min)"
    for NS in "${NAMESPACES[@]}"; do
        if ! kubectl get namespace "$NS" &>/dev/null; then continue; fi

        local events
        events=$(kubectl get events -n "$NS" --field-selector type=Warning \
            --sort-by='.lastTimestamp' 2>/dev/null | tail -8 || echo "")

        if [ -n "$events" ]; then
            echo -e "\n  ${YELLOW}Namespace: $NS${NC}"
            echo "$events" | while IFS= read -r line; do
                warning "$line"
                ERROR_LOGS+=("[$NS] $line")
            done
        fi
    done
}

# ─── 3. Recent ERROR Log Lines ────────────────────────────────────────────────
check_error_logs() {
    header "Error Log Scan (last 100 lines per pod)"
    for NS in "${NAMESPACES[@]}"; do
        if ! kubectl get namespace "$NS" &>/dev/null; then continue; fi

        local pod_names
        pod_names=$(kubectl get pods -n "$NS" --no-headers \
            --field-selector=status.phase=Running \
            -o custom-columns=":metadata.name" 2>/dev/null || echo "")

        for pod in $pod_names; do
            local errors
            errors=$(kubectl logs "$pod" -n "$NS" --tail=100 2>/dev/null \
                | grep -iE '"severity":"ERROR"|ERROR|Exception|FATAL' \
                | head -5 || echo "")

            if [ -n "$errors" ]; then
                echo ""
                error "❌ Errors in pod: $NS/$pod"
                echo "$errors" | while IFS= read -r line; do
                    echo -e "    ${RED}│${NC} $line"
                    ERROR_LOGS+=("[$NS/$pod] $line")
                done
            fi
        done
    done

    if [ ${#ERROR_LOGS[@]} -eq 0 ]; then
        success "No error logs found in running pods"
    fi
}

# ─── 4. Actuator Health Endpoints ─────────────────────────────────────────────
check_actuator_health() {
    header "Spring Boot Actuator Health"
    declare -A SERVICES=(
        ["api-gateway"]="backend"
        ["discovery-server"]="backend"
        ["payment-service"]="backend"
        ["auth-service"]="backend"
    )

    for SVC in "${!SERVICES[@]}"; do
        NS="${SERVICES[$SVC]}"
        if ! kubectl get svc "$SVC" -n "$NS" &>/dev/null; then
            warning "Service $SVC not found in namespace $NS"
            continue
        fi

        local pod
        pod=$(kubectl get pods -n "$NS" -l "app=$SVC" --no-headers \
            -o custom-columns=":metadata.name" 2>/dev/null | head -1 || echo "")

        if [ -z "$pod" ]; then
            warning "No pod found for $SVC"
            continue
        fi

        local health_status
        health_status=$(kubectl exec "$pod" -n "$NS" -- \
            curl -sf "http://localhost:8080/actuator/health" 2>/dev/null \
            | grep -o '"status":"[^"]*"' | head -1 || echo '"status":"UNREACHABLE"')

        if echo "$health_status" | grep -q '"UP"'; then
            success "$SVC actuator: UP"
        else
            error "$SVC actuator: $health_status"
            FAILED_PODS+=("$SVC actuator: $health_status")
        fi
    done
}

# ─── 5. Disk and Resource Usage ───────────────────────────────────────────────
check_resources() {
    header "Node Resource Usage"
    kubectl top nodes 2>/dev/null || warning "kubectl top not available (metrics-server may not be running)"

    echo ""
    header "Pod Resource Usage — Backend"
    kubectl top pods -n backend 2>/dev/null || warning "kubectl top pods not available"
}

# ─── 6. Alerts ────────────────────────────────────────────────────────────────
send_slack_alert() {
    if [ -z "$SLACK_WEBHOOK_URL" ]; then return; fi
    if [ ${#FAILED_PODS[@]} -eq 0 ] && [ ${#ERROR_LOGS[@]} -eq 0 ]; then return; fi

    local msg="🚨 *Health Check Alert* — $(date '+%Y-%m-%d %H:%M:%S')\n\n"

    if [ ${#FAILED_PODS[@]} -gt 0 ]; then
        msg+="*Failed/Unhealthy Pods:*\n"
        for p in "${FAILED_PODS[@]}"; do msg+="  • $p\n"; done
    fi

    if [ ${#ERROR_LOGS[@]} -gt 0 ]; then
        msg+="\n*Recent Errors (first 5):*\n"
        for i in "${!ERROR_LOGS[@]}"; do
            [ "$i" -ge 5 ] && break
            msg+="  \`${ERROR_LOGS[$i]}\`\n"
        done
    fi

    curl -s -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-type: application/json' \
        --data "{\"text\": \"$msg\"}" > /dev/null

    log "Slack alert sent."
}

send_email_alert() {
    if [ -z "$ALERT_EMAIL" ]; then return; fi
    if [ ${#FAILED_PODS[@]} -eq 0 ] && [ ${#ERROR_LOGS[@]} -eq 0 ]; then return; fi

    if ! command -v mail &>/dev/null; then
        warning "mail command not found — cannot send email alert"
        return
    fi

    {
        echo "Health Check Alert — $(date)"
        echo ""
        echo "Failed Pods:"
        printf '  - %s\n' "${FAILED_PODS[@]:-none}"
        echo ""
        echo "Recent Errors:"
        printf '  - %s\n' "${ERROR_LOGS[@]:0:10}"
        echo ""
        echo "Full log: $LOG_FILE"
    } | mail -s "🚨 K8s Health Alert — $(hostname)" "$ALERT_EMAIL"

    log "Email alert sent to $ALERT_EMAIL"
}

# ─── Summary ──────────────────────────────────────────────────────────────────
print_summary() {
    echo ""
    echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}  Health Check Summary — $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"

    if [ ${#FAILED_PODS[@]} -eq 0 ] && [ ${#ERROR_LOGS[@]} -eq 0 ]; then
        echo -e "\n  ${GREEN}${BOLD}✅ ALL SYSTEMS HEALTHY${NC}\n"
    else
        echo -e "\n  ${RED}${BOLD}❌ ISSUES DETECTED${NC}"
        echo ""
        if [ ${#FAILED_PODS[@]} -gt 0 ]; then
            echo -e "  ${RED}Unhealthy Pods (${#FAILED_PODS[@]}):${NC}"
            for p in "${FAILED_PODS[@]}"; do echo "    • $p"; done
        fi
        if [ ${#ERROR_LOGS[@]} -gt 0 ]; then
            echo -e "\n  ${YELLOW}Error log entries: ${#ERROR_LOGS[@]}${NC}"
            echo "  (see $LOG_FILE for full details)"
        fi
        echo ""
    fi
    echo -e "  Log file: ${CYAN}$LOG_FILE${NC}\n"
}

# ─── Main ─────────────────────────────────────────────────────────────────────
run_all_checks() {
    check_kubectl
    check_pods
    check_events
    check_error_logs
    check_actuator_health
    check_resources
    print_summary
    send_slack_alert
    send_email_alert
}

echo -e "${BOLD}${CYAN}"
echo "╔══════════════════════════════════════════════════╗"
echo "║   🔍 Spring K8s System Health Monitor            ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

case "${1:-}" in
    --watch)
        info "Running in continuous watch mode (every ${WATCH_INTERVAL}s). Press Ctrl+C to stop."
        while true; do
            FAILED_PODS=(); ERROR_LOGS=()
            run_all_checks
            echo -e "\n${CYAN}Next check in ${WATCH_INTERVAL}s...${NC}"
            sleep "$WATCH_INTERVAL"
        done
        ;;
    --slack-alert)
        run_all_checks
        if [ -z "$SLACK_WEBHOOK_URL" ]; then
            error "SLACK_WEBHOOK_URL not set. Export it first:"
            echo "  export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/...'"
        fi
        ;;
    *)
        run_all_checks
        ;;
esac

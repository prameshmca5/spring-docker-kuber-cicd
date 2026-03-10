#!/bin/bash

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"

echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}ArgoCD Sync Issue Diagnostic Tool${NC}"
echo -e "${HEADER}==========================================${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command_exists kubectl; then
    echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

if ! command_exists helm; then
    echo -e "${YELLOW}⚠️  Helm is not installed. Some diagnostics may be limited.${NC}"
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check ArgoCD installation
echo -e "${BLUE}Checking ArgoCD installation...${NC}"
if ! kubectl get namespace argocd >/dev/null 2>&1; then
    echo -e "${RED}❌ ArgoCD namespace not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ArgoCD namespace found${NC}"

# Check ArgoCD pods
echo -e "${BLUE}Checking ArgoCD pods...${NC}"
argocd_pods=$(kubectl get pods -n argocd --no-headers 2>/dev/null | wc -l)
if [ "$argocd_pods" -eq 0 ]; then
    echo -e "${RED}❌ No ArgoCD pods found${NC}"
    exit 1
fi

running_pods=$(kubectl get pods -n argocd --no-headers 2>/dev/null | grep "Running" | wc -l)
echo -e "${GREEN}✅ ArgoCD pods: $running_pods/$argocd_pods running${NC}"

# Check all applications
echo -e "${BLUE}Checking all ArgoCD applications...${NC}"
echo -e ""
echo -e "${HEADER}Application Status Summary:${NC}"
kubectl get applications -n argocd

# Check for specific sync errors
echo -e ""
echo -e "${BLUE}Checking for sync errors...${NC}"

# Get applications with sync issues
sync_issues=$(kubectl get applications -n argocd -o json | jq -r '.items[] | select(.status.sync.status != "Synced") | .metadata.name' 2>/dev/null)

if [ ! -z "$sync_issues" ]; then
    echo -e "${YELLOW}Applications with sync issues:${NC}"
    for app in $sync_issues; do
        echo -e "${YELLOW}- $app${NC}"
        
        # Get detailed sync status
        sync_status=$(kubectl get application "$app" -n argocd -o jsonpath="{.status.sync.status}" 2>/dev/null)
        health_status=$(kubectl get application "$app" -n argocd -o jsonpath="{.status.health.status}" 2>/dev/null)
        
        echo -e "  Sync Status: $sync_status"
        echo -e "  Health Status: $health_status"
        
        # Check for specific error messages
        conditions=$(kubectl get application "$app" -n argocd -o jsonpath="{.status.conditions}" 2>/dev/null)
        if [ ! -z "$conditions" ] && [ "$conditions" != "[]" ]; then
            echo -e "  Conditions: $conditions"
        fi
        
        # Check recent events
        echo -e "  Recent Events:"
        kubectl get events -n argocd --field-selector involvedObject.name="$app" --sort-by='.lastTimestamp' | tail -3 | sed 's/^/    /'
        
        echo ""
    done
else
    echo -e "${GREEN}✅ No sync issues found${NC}"
fi

# Check Helm chart validity for backend services
echo -e "${BLUE}Checking Helm chart validity...${NC}"
if command_exists helm; then
    echo -e "Testing banking-service Helm chart..."
    
    # Test with discovery-server values
    if helm template test-release helm-charts/banking-service \
        --set serviceName=discovery-server \
        --set service.port=8761 \
        --set image.repository=springbootapps-discovery-server \
        --set image.tag=latest \
        --set ingress.enabled=true \
        --set ingress.host=qactsai.local \
        --set activeColor=blue \
        --set color=blue \
        --set createService=true >/dev/null 2>&1; then
        echo -e "${GREEN}✅ banking-service Helm chart renders successfully${NC}"
    else
        echo -e "${RED}❌ banking-service Helm chart has rendering issues${NC}"
        echo -e "${YELLOW}Helm template errors:${NC}"
        helm template test-release helm-charts/banking-service \
            --set serviceName=discovery-server \
            --set service.port=8761 \
            --set image.repository=springbootapps-discovery-server \
            --set image.tag=latest \
            --set ingress.enabled=true \
            --set ingress.host=qactsai.local \
            --set activeColor=blue \
            --set color=blue \
            --set createService=true 2>&1 | head -5
    fi
    
    # Test frontend chart
    echo -e "Testing frontend Helm chart..."
    if helm template test-release helm-charts/springbootapp-frontend >/dev/null 2>&1; then
        echo -e "${GREEN}✅ frontend Helm chart renders successfully${NC}"
    else
        echo -e "${RED}❌ frontend Helm chart has rendering issues${NC}"
        helm template test-release helm-charts/springbootapp-frontend 2>&1 | head -5
    fi
else
    echo -e "${YELLOW}⚠️  Helm not available - skipping chart validation${NC}"
fi

# Check for missing CRDs or resources
echo -e "${BLUE}Checking for missing resources...${NC}"

# Check if backend namespace exists
if kubectl get namespace backend >/dev/null 2>&1; then
    echo -e "${GREEN}✅ backend namespace exists${NC}"
else
    echo -e "${RED}❌ backend namespace missing${NC}"
fi

# Check if frontend namespace exists
if kubectl get namespace frontend >/dev/null 2>&1; then
    echo -e "${GREEN}✅ frontend namespace exists${NC}"
else
    echo -e "${RED}❌ frontend namespace missing${NC}"
fi

# Check if monitoring namespace exists
if kubectl get namespace monitoring >/dev/null 2>&1; then
    echo -e "${GREEN}✅ monitoring namespace exists${NC}"
else
    echo -e "${RED}❌ monitoring namespace missing${NC}"
fi

# Check repository access
echo -e "${BLUE}Checking repository access...${NC}"
if kubectl get secrets -n argocd | grep -q "argocd-repo-server-tls"; then
    echo -e "${GREEN}✅ Repository server TLS configured${NC}"
else
    echo -e "${YELLOW}⚠️  Repository server TLS not configured${NC}"
fi

# Check ApplicationSet status specifically
echo -e "${BLUE}Checking ApplicationSet status...${NC}"
if kubectl get applicationset banking-backend-services -n argocd >/dev/null 2>&1; then
    echo -e "${GREEN}✅ banking-backend-services ApplicationSet exists${NC}"
    
    # Check generated applications
    generated_apps=$(kubectl get applications -n argocd -l app.kubernetes.io/part-of=banking-platform --no-headers 2>/dev/null | wc -l)
    echo -e "Generated applications: $generated_apps"
    
    if [ "$generated_apps" -eq 0 ]; then
        echo -e "${RED}❌ No applications generated by ApplicationSet${NC}"
        echo -e "${YELLOW}ApplicationSet details:${NC}"
        kubectl describe applicationset banking-backend-services -n argocd | head -10
    fi
else
    echo -e "${RED}❌ banking-backend-services ApplicationSet not found${NC}"
fi

# Summary and recommendations
echo -e ""
echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}Diagnostic Complete${NC}"
echo -e "${HEADER}==========================================${NC}"
echo -e ""
echo -e "${BLUE}Common fixes to try:${NC}"
echo -e "1. Apply the fixed configuration: ${GREEN}kubectl apply -f argocd/apps/backend-services.yaml${NC}"
echo -e "2. Force sync applications: ${GREEN}argocd app sync <app-name> --force${NC}"
echo -e "3. Check ArgoCD logs: ${GREEN}kubectl logs -n argocd deployment/argocd-application-controller${NC}"
echo -e "4. Restart ArgoCD application controller: ${GREEN}kubectl rollout restart deployment/argocd-application-controller -n argocd${NC}"
echo -e ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "- Run the fix script: ${GREEN}./fix-backend-services.sh${NC}"
echo -e "- Check ArgoCD UI: ${GREEN}kubectl port-forward svc/argocd-server -n argocd 8080:443${NC}"
echo -e "- Monitor sync status: ${GREEN}kubectl get applications -n argocd -w${NC}"
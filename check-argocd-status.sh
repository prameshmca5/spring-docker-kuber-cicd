#!/bin/bash

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"

echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}ArgoCD Application Status Check${NC}"
echo -e "${HEADER}==========================================${NC}"

# Function to check application status
check_application() {
    local app_name=$1
    local app_type=$2
    
    echo -e "${BLUE}Checking $app_type: $app_name...${NC}"
    
    # Get application status
    local status=$(kubectl get application "$app_name" -n argocd -o jsonpath="{.status.sync.status}" 2>/dev/null)
    local health=$(kubectl get application "$app_name" -n argocd -o jsonpath="{.status.health.status}" 2>/dev/null)
    
    if [ -z "$status" ] || [ -z "$health" ]; then
        echo -e "${RED}❌ Application not found or unable to get status${NC}"
        return 1
    fi
    
    if [ "$status" == "Synced" ] && [ "$health" == "Healthy" ]; then
        echo -e "${GREEN}✅ $app_name - Sync: $status, Health: $health${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $app_name - Sync: $status, Health: $health${NC}"
        
        # Show recent events
        echo -e "${BLUE}Recent events:${NC}"
        kubectl get events -n argocd --field-selector involvedObject.name="$app_name" --sort-by='.lastTimestamp' | tail -5
        return 1
    fi
}

# Check if ArgoCD is installed
echo -e "${BLUE}Checking ArgoCD installation...${NC}"
if ! kubectl get namespace argocd >/dev/null 2>&1; then
    echo -e "${RED}❌ ArgoCD namespace not found. Please install ArgoCD first.${NC}"
    exit 1
fi

# Check ArgoCD pods
echo -e "${BLUE}Checking ArgoCD pods...${NC}"
argocd_pods=$(kubectl get pods -n argocd --no-headers 2>/dev/null | wc -l)
if [ "$argocd_pods" -eq 0 ]; then
    echo -e "${RED}❌ No ArgoCD pods found${NC}"
    exit 1
fi

running_pods=$(kubectl get pods -n argocd --no-headers 2>/dev/null | grep "Running" | wc -l)
echo -e "${GREEN}✅ ArgoCD pods: $running_pods/$argocd_pods running${NC}"

# Check individual applications
echo ""
echo -e "${BLUE}Checking individual applications...${NC}"

# Check root application
check_application "banking-platform" "Root Application"

# Check backend-shared application
check_application "backend-shared" "Backend Shared Application"

# Check frontend application
check_application "frontend" "Frontend Application"

# Check monitoring application
check_application "monitoring" "Monitoring Application"

# Check backend service applications
backend_apps=("discovery-server" "api-gateway" "account-service" "customer-service" "transaction-service" "notification-service" "payment-service" "employee-service" "common-service" "auth-service")
for app in "${backend_apps[@]}"; do
    check_application "$app" "Backend Service"
done

# Check database applications
db_apps=("db-storage" "db-mysql-shared" "kafka" "db-auth-postgres" "mysql-account" "postgres-customer" "mysql-transaction" "mysql-common" "mysql-notification" "mysql-payment" "postgres-employee")
for app in "${db_apps[@]}"; do
    check_application "$app" "Database Application"
done

# Check for common issues
echo ""
echo -e "${BLUE}Checking for common issues...${NC}"

# Check if namespaces exist
namespaces=("argocd" "backend" "frontend" "monitoring" "db" "external-tools")
for ns in "${namespaces[@]}"; do
    if kubectl get namespace "$ns" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Namespace $ns exists${NC}"
    else
        echo -e "${RED}❌ Namespace $ns missing${NC}"
    fi
done

# Check repository connection
echo ""
echo -e "${BLUE}Checking repository connection...${NC}"
if kubectl get secrets -n argocd | grep -q "argocd-repo-server-tls"; then
    echo -e "${GREEN}✅ Repository server TLS configured${NC}"
else
    echo -e "${YELLOW}⚠️  Repository server TLS not configured${NC}"
fi

# Summary
echo ""
echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}ArgoCD Status Check Complete${NC}"
echo -e "${HEADER}==========================================${NC}"
echo -e "To view all applications: ${BLUE}kubectl get applications -n argocd${NC}"
echo -e "To check logs: ${BLUE}kubectl logs -n argocd deployment/argocd-application-controller${NC}"
echo -e "To access ArgoCD UI: ${BLUE}kubectl port-forward svc/argocd-server -n argocd 8080:443${NC}"

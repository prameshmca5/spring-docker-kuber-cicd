#!/bin/bash

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"

echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}Fixing ArgoCD Backend Services Sync Issues${NC}"
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

if ! command_exists minikube; then
    echo -e "${RED}Minikube is not installed. Please install Minikube first.${NC}"
    exit 1
fi

# Check if Minikube is running
if ! minikube status >/dev/null 2>&1; then
    echo -e "${RED}Minikube is not running. Please start Minikube first with: minikube start${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Step 1: Check if ArgoCD is installed
echo -e "${BLUE}Step 1: Checking ArgoCD installation...${NC}"
if ! kubectl get namespace argocd >/dev/null 2>&1; then
    echo -e "${RED}ArgoCD is not installed. Please install ArgoCD first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ArgoCD is installed${NC}"

# Step 2: Create backend namespace if it doesn't exist
echo -e "${BLUE}Step 2: Ensuring backend namespace exists...${NC}"
kubectl create namespace backend --dry-run=client -o yaml | kubectl apply -f -

# Step 3: Apply the fixed backend-services configuration
echo -e "${BLUE}Step 3: Applying fixed backend-services configuration...${NC}"
kubectl apply -f argocd/apps/backend-services.yaml

# Step 4: Wait for applications to be created
echo -e "${BLUE}Step 4: Waiting for backend service applications to be created...${NC}"
sleep 10

# Step 5: Check individual application status
echo -e "${BLUE}Step 5: Checking individual backend service applications...${NC}"

services=("discovery-server" "api-gateway" "account-service" "customer-service" "transaction-service" "notification-service" "payment-service" "employee-service" "common-service" "auth-service")

for service in "${services[@]}"; do
    echo -e "${BLUE}Checking $service...${NC}"
    
    # Check if application exists
    if kubectl get application "$service" -n argocd >/dev/null 2>&1; then
        status=$(kubectl get application "$service" -n argocd -o jsonpath="{.status.sync.status}" 2>/dev/null)
        health=$(kubectl get application "$service" -n argocd -o jsonpath="{.status.health.status}" 2>/dev/null)
        
        if [ "$status" == "Synced" ] && [ "$health" == "Healthy" ]; then
            echo -e "${GREEN}✅ $service - Sync: $status, Health: $health${NC}"
        else
            echo -e "${YELLOW}⚠️  $service - Sync: $status, Health: $health${NC}"
            
            # Show recent events for this application
            echo -e "${BLUE}Recent events for $service:${NC}"
            kubectl get events -n argocd --field-selector involvedObject.name="$service" --sort-by='.lastTimestamp' | tail -3
        fi
    else
        echo -e "${RED}❌ $service application not found${NC}"
    fi
done

# Step 6: Check for common Helm template issues
echo -e "${BLUE}Step 6: Checking for common Helm template issues...${NC}"

# Check if the Helm chart can be rendered
echo -e "${BLUE}Testing Helm template rendering for discovery-server...${NC}"
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
    echo -e "${GREEN}✅ Helm template renders successfully${NC}"
else
    echo -e "${RED}❌ Helm template rendering failed${NC}"
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
        --set createService=true 2>&1 | head -10
fi

# Step 7: Force sync problematic applications
echo -e "${BLUE}Step 7: Force syncing problematic applications...${NC}"
for service in "${services[@]}"; do
    status=$(kubectl get application "$service" -n argocd -o jsonpath="{.status.sync.status}" 2>/dev/null)
    if [ "$status" != "Synced" ]; then
        echo -e "${BLUE}Force syncing $service...${NC}"
        argocd app sync "$service" --force --prune || true
    fi
done

# Step 8: Final status check
echo -e "${BLUE}Step 8: Final status check...${NC}"
echo -e ""
echo -e "${HEADER}Backend Services Status:${NC}"
kubectl get applications -n argocd -l app.kubernetes.io/part-of=banking-platform

echo -e ""
echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}Backend Services Sync Fix Complete!${NC}"
echo -e "${HEADER}==========================================${NC}"
echo -e ""
echo -e "To check detailed status: ${BLUE}kubectl get applications -n argocd${NC}"
echo -e "To view ArgoCD UI: ${BLUE}kubectl port-forward svc/argocd-server -n argocd 8080:443${NC}"
echo -e "To check logs: ${BLUE}kubectl logs -n argocd deployment/argocd-application-controller${NC}"
echo -e ""
echo -e "${YELLOW}Note: It may take a few minutes for all applications to sync completely.${NC}"
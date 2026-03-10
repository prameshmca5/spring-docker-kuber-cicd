#!/bin/bash

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"

echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}Installing ArgoCD in Minikube${NC}"
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

# Create argocd namespace
echo -e "${BLUE}Creating ArgoCD namespace...${NC}"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Install ArgoCD
echo -e "${BLUE}Installing ArgoCD...${NC}"
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
echo -e "${BLUE}Waiting for ArgoCD to be ready...${NC}"
MAX_RETRIES=60
RETRY_COUNT=0
ARGOCD_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # Check if argocd-server is running
    ARGOCD_POD=$(kubectl get pods -n argocd -l app.kubernetes.io/name=argocd-server -o jsonpath="{.items[0].metadata.name}" 2>/dev/null)
    
    if [ ! -z "$ARGOCD_POD" ]; then
        POD_STATUS=$(kubectl get pod -n argocd "$ARGOCD_POD" -o jsonpath="{.status.phase}" 2>/dev/null)
        if [ "$POD_STATUS" == "Running" ]; then
            echo -e "${GREEN}✅ ArgoCD server is running${NC}"
            ARGOCD_READY=true
            break
        fi
    fi
    
    echo -n "."
    sleep 10
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$ARGOCD_READY" = false ]; then
    echo -e "\n${RED}Timeout waiting for ArgoCD to be ready${NC}"
    exit 1
fi

# Get ArgoCD admin password
echo -e "${BLUE}Getting ArgoCD admin password...${NC}"
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

# Port forward ArgoCD UI
echo -e "${BLUE}Setting up ArgoCD UI port forward...${NC}"
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address=127.0.0.1 > /tmp/argocd-portforward.log 2>&1 &
ARGOCD_PID=$!
sleep 3

# Verify port-forward is working
if lsof -nP -iTCP:8080 -sTCP:LISTEN 2>/dev/null | grep -q "kubectl"; then
    echo -e "${GREEN}✅ ArgoCD UI port-forward active on port 8080${NC}"
else
    echo -e "${YELLOW}⚠️  ArgoCD port-forward may not have started. Check: cat /tmp/argocd-portforward.log${NC}"
fi

# Apply root application
echo -e "${BLUE}Applying ArgoCD root application...${NC}"
kubectl apply -f argocd/root-application.yaml

# Wait for applications to sync
echo -e "${BLUE}Waiting for applications to sync...${NC}"
sleep 10

echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}ArgoCD Installation Complete!${NC}"
echo -e "${HEADER}==========================================${NC}"
echo -e "ArgoCD UI: ${GREEN}http://localhost:8080${NC}"
echo -e "Username: ${GREEN}admin${NC}"
echo -e "Password: ${GREEN}$ARGOCD_PASSWORD${NC}"
echo ""
echo -e "To stop ArgoCD port-forward: ${RED}kill $ARGOCD_PID${NC}"
echo -e "To view applications: ${BLUE}kubectl get applications -n argocd${NC}"
echo -e "To check sync status: ${BLUE}argocd app list${NC}"
echo ""
echo -e "${YELLOW}Note: It may take a few minutes for all applications to sync completely.${NC}"
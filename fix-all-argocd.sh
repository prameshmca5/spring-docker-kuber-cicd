#!/bin/bash

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"

echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}Fixing All ArgoCD Configuration Issues${NC}"
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

# Step 1: Install ArgoCD if not already installed
echo -e "${BLUE}Step 1: Installing ArgoCD...${NC}"
if ! kubectl get namespace argocd >/dev/null 2>&1; then
    echo -e "${BLUE}Creating ArgoCD namespace...${NC}"
    kubectl create namespace argocd
    
    echo -e "${BLUE}Installing ArgoCD...${NC}"
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    
    # Wait for ArgoCD to be ready
    echo -e "${BLUE}Waiting for ArgoCD to be ready...${NC}"
    MAX_RETRIES=60
    RETRY_COUNT=0
    ARGOCD_READY=false
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
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
else
    echo -e "${GREEN}✅ ArgoCD already installed${NC}"
fi

# Step 2: Fix monitoring application configuration
echo -e "${BLUE}Step 2: Fixing monitoring application configuration...${NC}"
cat > argocd/apps/monitoring.yaml << 'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: monitoring
  namespace: argocd
  annotations:
    argocd.argoproj.io/sync-wave: "3"
spec:
  project: monitoring
  source:
    repoURL: https://github.com/prameshmca5/spring-docker-kuber-cicd.git
    targetRevision: cicd-docker-k8s-helm-argocd
    path: helm-charts/monitoring-stack
  destination:
    server: https://kubernetes.default.svc
    namespace: monitoring
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF

echo -e "${GREEN}✅ Monitoring application configuration fixed${NC}"

# Step 3: Apply all ArgoCD applications
echo -e "${BLUE}Step 3: Applying all ArgoCD applications...${NC}"

# Apply in order based on sync-wave annotations
echo -e "${BLUE}Applying backend-shared (wave 0)...${NC}"
kubectl apply -f argocd/apps/backend-shared.yaml

sleep 5

echo -e "${BLUE}Applying backend-services (wave 1)...${NC}"
kubectl apply -f argocd/apps/backend-services.yaml

sleep 5

echo -e "${BLUE}Applying frontend (wave 2)...${NC}"
kubectl apply -f argocd/apps/frontend.yaml

sleep 5

echo -e "${BLUE}Applying monitoring (wave 3)...${NC}"
kubectl apply -f argocd/apps/monitoring.yaml

# Step 4: Apply root application
echo -e "${BLUE}Step 4: Applying root application...${NC}"
kubectl apply -f argocd/root-application.yaml

echo -e "${GREEN}✅ All applications applied${NC}"

# Step 5: Wait for applications to sync
echo -e "${BLUE}Step 5: Waiting for applications to sync...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"

MAX_WAIT=300
WAIT_COUNT=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    # Check overall sync status
    APPS=$(kubectl get applications -n argocd --no-headers 2>/dev/null | wc -l)
    SYNCED=$(kubectl get applications -n argocd --no-headers 2>/dev/null | grep "Synced.*Healthy" | wc -l)
    
    if [ "$APPS" -gt 0 ] && [ "$SYNCED" -eq "$APPS" ]; then
        echo -e "${GREEN}✅ All applications synced successfully!${NC}"
        break
    fi
    
    echo -n "."
    sleep 10
    WAIT_COUNT=$((WAIT_COUNT+10))
done

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    echo -e "\n${YELLOW}Timeout waiting for all applications to sync${NC}"
fi

# Step 6: Setup port forwards
echo -e "${BLUE}Step 6: Setting up port forwards...${NC}"

# Kill existing port-forwards
pkill -f "kubectl port-forward.*ingress-nginx" 2>/dev/null || true
pkill -f "kubectl port-forward.*argocd-server" 2>/dev/null || true
sleep 2

# Start ArgoCD port-forward
kubectl port-forward svc/argocd-server -n argocd 8080:443 --address=127.0.0.1 > /tmp/argocd-portforward.log 2>&1 &
ARGOCD_PID=$!
sleep 3

# Start Ingress port-forward
kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8888:80 --address=127.0.0.1 > /tmp/k8s-portforward.log 2>&1 &
INGRESS_PID=$!
sleep 3

# Get ArgoCD password
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d 2>/dev/null)

# Step 7: Final status check
echo -e "${BLUE}Step 7: Final status check...${NC}"
echo -e ""
echo -e "${HEADER}Application Status:${NC}"
kubectl get applications -n argocd

echo -e ""
echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}ArgoCD Configuration Fix Complete!${NC}"
echo -e "${HEADER}==========================================${NC}"
echo -e ""
echo -e "ArgoCD UI: ${GREEN}http://localhost:8080${NC}"
echo -e "Username: ${GREEN}admin${NC}"
echo -e "Password: ${GREEN}$ARGOCD_PASSWORD${NC}"
echo -e ""
echo -e "Application URLs:"
echo -e "👉 ${GREEN}http://qactsai.local:8888/discovery-server${NC} (Discovery Server)"
echo -e "👉 ${GREEN}http://qactsai.local:8888/login${NC} (Frontend)"
echo -e ""
echo -e "To stop port-forwards:"
echo -e "${RED}kill $ARGOCD_PID $INGRESS_PID${NC}"
echo -e ""
echo -e "To check status: ${BLUE}./check-argocd-status.sh${NC}"
echo -e ""
echo -e "${YELLOW}Note: Some applications may still be syncing. Check ArgoCD UI for real-time status.${NC}"

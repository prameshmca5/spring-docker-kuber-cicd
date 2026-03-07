#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status

# Export necessary PATHs for Homebrew installations
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin

source "$(dirname "$0")/colors.sh"

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}  🚀 Starting Full Local CI/CD Pipeline Deployment  ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Variables
IMAGE_VERSION=$(date +%Y%m%d%H%M%S)
NAMESPACE="backend"

# 1. Initialize Minikube
echo -e "\n${BLUE}▶ Stage 1/9: Initializing Environment...${NC}"
if ! minikube status >/dev/null 2>&1; then
    echo "Starting Minikube..."
    minikube start --driver=docker
else
    echo "Minikube is already running."
fi
minikube addons enable ingress

# 2. Build Backend Java Apps
echo -e "\n${BLUE}▶ Stage 2/9: Building Backend Microservices (Maven)...${NC}"
chmod +x mvnw
./mvnw clean package -DskipTests --batch-mode

# 3. Build Docker Images
echo -e "\n${BLUE}▶ Stage 3/9: Building Docker Images...${NC}"
chmod +x build-images.sh
./build-images.sh "$IMAGE_VERSION"

# 4. Load Images into Minikube
echo -e "\n${BLUE}▶ Stage 4/9: Loading Images into Minikube...${NC}"
chmod +x load-images.sh
./load-images.sh "$IMAGE_VERSION"

# 5. Deploy Database Infrastructure
echo -e "\n${BLUE}▶ Stage 5/9: Deploying Databases...${NC}"
chmod +x install-db.sh
./install-db.sh

# 6. Deploy Backend Services
echo -e "\n${BLUE}▶ Stage 6/9: Deploying Backend Microservices via Helm...${NC}"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
chmod +x deploy-all.sh
./deploy-all.sh --namespace "$NAMESPACE"

# 7. Deploy Frontend
echo -e "\n${BLUE}▶ Stage 7/9: Deploying React Frontend via Helm...${NC}"
helm upgrade --install springbootapp-frontend ./helm-charts/springbootapp-frontend --namespace frontend --create-namespace --set image.tag="${IMAGE_VERSION:-latest}"

# 8. Deploy Monitoring Stack
echo -e "\n${BLUE}▶ Stage 8/9: Deploying Monitoring Stack...${NC}"
chmod +x install-monitoring.sh
./install-monitoring.sh

# 9. Finalize and Port-Forward
echo -e "\n${BLUE}▶ Stage 9/9: Waiting for Services and Starting Port-Forwarding...${NC}"
echo "Waiting for ingress controller to be ready..."

# Retry loop for ingress
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    INGRESS_STATUS=$(kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].status.phase}" 2>/dev/null)
    if [ "$INGRESS_STATUS" == "Running" ]; then
        break
    fi
    echo -n "."
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT+1))
done

echo -e "\nCleaning up old port-forwards..."
pkill -f "kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller" || true

echo "Starting new ingress port-forward on port 8888 in the background..."
nohup kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8888:80 > /tmp/k8s-portforward.log 2>&1 &
sleep 3

echo -e "\n${BLUE}======================================================${NC}"
echo -e "${GREEN}   ✅ PIPELINE EXECUTION SUCCESSFUL!   ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "\nYou can now access your application at:"
echo -e "👉 ${GREEN}http://qactsai.local:8888/login${NC}"
echo ""

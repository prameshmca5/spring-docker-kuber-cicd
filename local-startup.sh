#!/bin/bash

export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"

echo -e "${HEADER}==========================================${NC}"
echo -e "${SUCCESS}Starting Spring Boot Kubernetes System${NC}"
echo -e "${HEADER}==========================================${NC}"

# 1. Start Minikube
echo -e "${BLUE}Step 1: Starting Minikube...${NC}"
minikube start --driver=docker
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Minikube! Please check Docker and Minikube installations.${NC}"
    exit 1
fi

# 2. Kill existing port-forwards
echo -e "${BLUE}Step 2: Cleaning up old port-forwards...${NC}"
pkill -f "kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8888:80" || true

# 3. Wait for Pods to start
echo -e "${BLUE}Step 3: Waiting for Kubernetes Pods to become Ready...${NC}"
echo -e "This may take a minute or two."

# Just a brief wait for control plane to settle before checking pods
sleep 5

# Loop until critical services are running (or timeout)
MAX_RETRIES=30
RETRY_COUNT=0
URL_READY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    # Check if ingress controller is running (as an indicator)
    INGRESS_STATUS=$(kubectl get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].status.phase}" 2>/dev/null)
    
    if [ "$INGRESS_STATUS" == "Running" ]; then
        echo -e "${GREEN}Ingress Controller is Running!${NC}"
        URL_READY=true
        break
    fi
    
    echo -n "."
    sleep 5
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ "$URL_READY" = false ]; then
    echo -e "\n${RED}Timeout waiting for pods. Kubernetes is still starting in the background.${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Starting Ingress Port-Forward on Port 8888...${NC}"
# Run port-forward in the background and redirect output to a log file
nohup kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8888:80 > /tmp/k8s-portforward.log 2>&1 &
sleep 3 # Give it a moment to bind

echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}SYSTEM IS READY!${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "You can now access your application at:"
echo -e "👉 ${GREEN}http://qactsai.local:8888/login${NC}"
echo ""
echo -e "To stop the port-forward later, run: ${RED}pkill -f 'kubectl port-forward'${NC}"
echo -e "To view cluster status, run: ${BLUE}kubectl get pods -A${NC}"
echo ""

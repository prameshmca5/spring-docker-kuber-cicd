#!/bin/bash

# start-all.sh: Complete startup script for post-restart access on Port 80
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"

echo -e "${HEADER}================================================${NC}"
echo -e "${SUCCESS}   Universal Local Startup (Port 80)   ${NC}"
echo -e "${HEADER}================================================${NC}"

# 0. Request Sudo access early
echo -e "${YELLOW}This script requires sudo to bind to port 80.${NC}"
echo -e "${YELLOW}Please enter your password if prompted:${NC}"
sudo -v
if [ $? -ne 0 ]; then
    echo -e "${RED}Sudo authentication failed. Port 80 requires root privileges.${NC}"
    exit 1
fi

# Keep sudo alive in the background
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

# 1. Start Minikube
echo -e "${BLUE}Step 1: Ensuring Minikube is started...${NC}"
minikube status | grep -q "Running"
if [ $? -ne 0 ]; then
    minikube start --driver=docker
else
    echo -e "${GREEN}Minikube is already running.${NC}"
fi

# 2. Patch Ingress Controller to LoadBalancer
echo -e "${BLUE}Step 2: Configuring Ingress Controller...${NC}"
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec":{"type":"LoadBalancer"}}' --type=merge 2>/dev/null
echo -e "${GREEN}Ingress Service patched to LoadBalancer.${NC}"

# 3. Wait for Ingress Controller Pod
echo -e "${BLUE}Step 3: Waiting for Ingress controller to be ready...${NC}"
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# 4. Cleanup old port-forwards
echo -e "${BLUE}Step 4: Cleaning up previous port-forwards...${NC}"
sudo pkill -f "kubectl port-forward.*80:80" 2>/dev/null || true
pkill -f "kubectl port-forward.*8888:80" 2>/dev/null || true
sleep 1

# 5. Start Port-Forward on Port 80
echo -e "${BLUE}Step 5: Starting Ingress Port-Forward on Port 80...${NC}"
# Use sudo to bind to port 80
nohup sudo kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 80:80 --address=127.0.0.1 > /tmp/k8s-portforward-80.log 2>&1 &

# Wait for binding
sleep 4

# 6. Verify and Final Check
if lsof -nP -iTCP:80 -sTCP:LISTEN 2>/dev/null | grep -q "kubectl\|sudo"; then
    echo -e "${SUCCESS}================================================${NC}"
    echo -e "${GREEN}🚀 ALL SERVICES ARE READY ON PORT 80!${NC}"
    echo -e "${SUCCESS}================================================${NC}"
    echo -e "You can now access your services at:"
    echo -e "👉 ${GREEN}http://qactsai.local/login${NC}"
    echo -e "👉 ${GREEN}http://jaeger.local${NC}"
    echo -e "👉 ${GREEN}http://kibana.local${NC}"
    echo -e "👉 ${GREEN}http://grafana.local${NC}"
    echo -e "👉 ${GREEN}http://prometheus.local${NC}"
    echo -e "👉 ${GREEN}http://kafka-ui.local${NC}"
    echo ""
    echo -e "${YELLOW}Note: If pages don't load, check /tmp/k8s-portforward-80.log${NC}"
    echo -e "${YELLOW}Note: Ensure '127.0.0.1 kafka-ui.local' is in your /etc/hosts file.${NC}"
else
    echo -e "${RED}Error: Port 80 could not be bound. Checking log...${NC}"
    cat /tmp/k8s-portforward-80.log
fi

echo -e "To stop services: ${RED}sudo pkill -f 'kubectl port-forward'${NC}"
echo ""

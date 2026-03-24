#!/bin/bash

# start-all.sh: Complete startup script for post-restart access on Port 80
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin
source "$(dirname "$0")/colors.sh"
source "$(dirname "$0")/k8s-preflight.sh"

echo -e "${HEADER}================================================${NC}"
echo -e "${SUCCESS}   Universal Local Startup (Port 80)   ${NC}"
echo -e "${HEADER}================================================${NC}"

# Preflight: verify binaries and wait for Docker before requesting sudo
echo -e "${BLUE}Preflight: Checking Docker, Minikube, and kubectl...${NC}"
if ! init_k8s_binaries; then
    exit 1
fi

if ! wait_for_docker_daemon; then
    exit 1
fi

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
"$MINIKUBE_BIN" status | grep -q "Running"
if [ $? -ne 0 ]; then
    "$MINIKUBE_BIN" start --driver=docker
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to start Minikube. Docker is reachable, so inspect the Minikube output above for the exact cause.${NC}"
        exit 1
    fi
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
pkill -f "kubectl port-forward.*8761:8761" 2>/dev/null || true
pkill -f "kubectl port-forward.*8095:443" 2>/dev/null || true
sleep 1

# 5. Detect Local IP for Whitelisting
echo -e "${BLUE}Step 5: Detecting local IP for database whitelisting...${NC}"
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "127.0.0.1")
echo -e "${GREEN}Detected Local IP: ${LOCAL_IP}${NC}"

# 6. Apply Whitelist to Databases and Ingress
echo -e "${BLUE}Step 6: Access-Restricting Database Services (Whitelisting)...${NC}"
DB_SVCS=$(kubectl get svc -n db -o name | grep -E "mysql|postgres")
for svc in $DB_SVCS; do
    kubectl patch $svc -n db -p "{\"spec\":{\"type\":\"LoadBalancer\",\"loadBalancerSourceRanges\":[\"${LOCAL_IP}/32\",\"127.0.0.1/32\"]}}" 2>/dev/null
done
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p "{\"spec\":{\"loadBalancerSourceRanges\":[\"${LOCAL_IP}/32\",\"127.0.0.1/32\"]}}" 2>/dev/null
echo -e "${GREEN}IP Whitelist applied to Ingress and Databases (${LOCAL_IP}).${NC}"

# 7. Start Port-Forward on Port 80
echo -e "${BLUE}Step 7: Starting Ingress Port-Forward on Port 80...${NC}"
# Use sudo to bind to port 80
nohup sudo kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 80:80 --address=127.0.0.1 > /tmp/k8s-portforward-80.log 2>&1 &

# Wait for binding
sleep 4

# 8. Start Discovery Server Port-Forward for Local View
echo -e "${BLUE}Step 8: Starting Discovery Server Port-Forward on 8761 (local view)...${NC}"
if kubectl get svc -n backend discovery-server >/dev/null 2>&1; then
    nohup kubectl port-forward --namespace=backend service/discovery-server 8761:8761 --address=127.0.0.1 > /tmp/k8s-portforward-8761.log 2>&1 &
    sleep 2
    if lsof -nP -iTCP:8761 -sTCP:LISTEN 2>/dev/null | grep -q "kubectl"; then
        echo -e "${GREEN}Discovery Server port-forward active on 127.0.0.1:8761${NC}"
    else
        echo -e "${YELLOW}Warning: Discovery Server port-forward may not have started. Check /tmp/k8s-portforward-8761.log${NC}"
    fi
else
    echo -e "${YELLOW}Warning: discovery-server service not found in namespace 'backend'. Skipping local view setup.${NC}"
fi

# 9. Start ArgoCD Port-Forward on Port 8095
echo -e "${BLUE}Step 9: Starting ArgoCD Port-Forward on 8095...${NC}"
if kubectl get svc -n argocd argocd-server >/dev/null 2>&1; then
    nohup kubectl port-forward --namespace=argocd service/argocd-server 8095:80 --address=127.0.0.1 > /tmp/k8s-portforward-8095.log 2>&1 &
    sleep 2
    if lsof -nP -iTCP:8095 -sTCP:LISTEN 2>/dev/null | grep -q "kubectl"; then
        echo -e "${GREEN}ArgoCD port-forward active on 127.0.0.1:8095${NC}"
    else
        echo -e "${YELLOW}Warning: ArgoCD port-forward may not have started. Check /tmp/k8s-portforward-8095.log${NC}"
    fi
else
    echo -e "${YELLOW}Warning: argocd-server service not found in namespace 'argocd'. Skipping ArgoCD setup.${NC}"
fi

# 10. Verify and Final Check
if lsof -nP -iTCP:80 -sTCP:LISTEN 2>/dev/null | grep -q "kubectl\|sudo"; then
    echo -e "${SUCCESS}================================================${NC}"
    echo -e "${GREEN}🚀 ALL SERVICES ARE READY ON PORT 80!${NC}"
    echo -e "${SUCCESS}================================================${NC}"
    echo -e "You can now access your services at:"
    echo -e "👉 ${GREEN}http://qactsai.local/discovery-server${NC} (Eureka / Service Discovery)"
    echo -e "👉 ${GREEN}http://localhost:8761${NC}              (Local Eureka View)"
    echo -e "👉 ${GREEN}http://qactsai.local/login${NC}"
    echo -e "👉 ${GREEN}http://jaeger.local${NC}"
    echo -e "👉 ${GREEN}http://kibana.local${NC}"
    echo -e "👉 ${GREEN}http://grafana.local${NC}"
    echo -e "👉 ${GREEN}http://prometheus.local${NC}"
    echo -e "👉 ${GREEN}http://kafka-ui.local${NC}"
    echo ""
    echo -e "${HEADER}ArgoCD Access:${NC}"
    echo -e "👉 ${GREEN}http://localhost:8095${NC}              (ArgoCD UI)"
    echo -e "Username: admin"
    echo -e "Password: $(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d 2>/dev/null || echo 'not available')"
    echo ""
    echo -e "${HEADER}Database Access (Whitelisted to ${LOCAL_IP}):${NC}"
    echo -e "Postgres: ${GREEN}springbootapp-db-postgres.db.svc.cluster.local:5432${NC}"
    echo -e "MySQL:    ${GREEN}mysql.db.svc.cluster.local:3306${NC}"
    echo ""
    echo -e "${YELLOW}Note: If pages don't load, check /tmp/k8s-portforward-80.log${NC}"
    echo -e "${YELLOW}Note: If Eureka local view doesn't load, check /tmp/k8s-portforward-8761.log${NC}"
    echo -e "${YELLOW}Note: If ArgoCD doesn't load, check /tmp/k8s-portforward-8095.log${NC}"
    echo -e "${YELLOW}Note: Ensure the following are in your /etc/hosts file:${NC}"
    echo -e "      127.0.0.1 kafka-ui.local mysql.db postgres.db"
else
    echo -e "${RED}Error: Port 80 could not be bound. Checking log...${NC}"
    cat /tmp/k8s-portforward-80.log
fi

echo -e "To stop services: ${RED}sudo pkill -f 'kubectl port-forward'${NC}"
echo ""

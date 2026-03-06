#!/bin/bash
set -e
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin

NAMESPACE="backend"
CHART_DIR="./helm-charts/banking-service"
KUBECTL=$(which kubectl || find /usr/local/bin /usr/bin /opt/homebrew/bin -name kubectl | head -n 1)
if [ -z "$KUBECTL" ]; then KUBECTL="kubectl"; fi
HELM=$(which helm || find /usr/local/bin /usr/bin /opt/homebrew/bin -name helm | head -n 1)
if [ -z "$HELM" ]; then HELM="helm"; fi

SERVICES=(
  "discovery-server"
  "api-gateway"
  "account-service"
  "customer-service"
  "transaction-service"
  "notification-service"
  "payment-service"
  "employee-service"
  "common-service"
  "auth-service"
)

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --namespace) NAMESPACE="$2"; shift ;;
        --service) SELECT_SERVICE="$2"; shift ;;
    esac
    shift
done

echo "Deploying Banking Ecosystem to namespace: $NAMESPACE"

if [ -n "$SELECT_SERVICE" ] && [ "$SELECT_SERVICE" != "ALL" ]; then
    echo "=> Selective deployment: $SELECT_SERVICE"
    ./deploy-service.sh "$SELECT_SERVICE" "$NAMESPACE"
else
    echo "=> Deploying all services..."
    for SERVICE in "${SERVICES[@]}"; do
      ./deploy-service.sh "$SERVICE" "$NAMESPACE"
    done
fi

echo "All microservices deployed successfully!"

# Monitoring Stack (only if manifest files exist)
if [ -f "./helm-charts/monitoring-stack.yaml" ]; then
  echo "=> Deploying monitoring stack..."
  $KUBECTL apply -f ./helm-charts/monitoring-stack.yaml 2>/dev/null || true
fi

if [ -f "./helm-charts/monitoring-ingress.yaml" ]; then
  echo "=> Deploying monitoring ingress..."
  $KUBECTL apply -f ./helm-charts/monitoring-ingress.yaml 2>/dev/null || true
fi

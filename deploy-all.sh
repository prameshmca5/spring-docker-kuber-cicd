#!/bin/bash
set -e

NAMESPACE="backend"
CHART_DIR="./helm-charts/banking-service"
KUBECTL=$(which kubectl || echo "kubectl")
HELM=$(which helm || echo "helm")

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

echo "Deploying Banking Ecosystem to namespace: $NAMESPACE"

for SERVICE in "${SERVICES[@]}"; do
  ./deploy-service.sh "$SERVICE" "$NAMESPACE"
done

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

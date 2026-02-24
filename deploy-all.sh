#!/bin/bash
set -e

NAMESPACE="backend"
CHART_DIR="./helm-charts/banking-service"
KUBECTL=$(which kubectl || echo "kubectl")

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
)

echo "Deploying Banking Ecosystem to namespace: $NAMESPACE"

for SERVICE in "${SERVICES[@]}"; do
  ./deploy-service.sh "$SERVICE" "$NAMESPACE"
done

echo "All microservices deployed successfully!"

# Monitoring Stack
echo "=> Deploying monitoring stack..."
$HELM apply -f ./helm-charts/monitoring-stack.yaml 2>/dev/null || $KUBECTL apply -f ./helm-charts/monitoring-stack.yaml
$KUBECTL apply -f ./helm-charts/monitoring-ingress.yaml

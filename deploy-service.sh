#!/bin/bash
set -e

SERVICE=$1
NAMESPACE=${2:-"backend"}
CHART_DIR="./helm-charts/banking-service"
HELM=$(which helm || echo "helm")

if [ -z "$SERVICE" ]; then
  echo "Usage: ./deploy-service.sh <service-name> [namespace]"
  exit 1
fi

VALUES_FILE="$CHART_DIR/values-$SERVICE.yaml"
ENV_VALUES="./helm-charts/environments/dev/$SERVICE.yaml"

if [ ! -f "$VALUES_FILE" ]; then
  echo "Error: Service values file not found at $VALUES_FILE"
  exit 1
fi

echo "=> Deploying $SERVICE to namespace: $NAMESPACE"

if [ -f "$ENV_VALUES" ]; then
  $HELM upgrade --install "$SERVICE" "$CHART_DIR" \
    -f "$VALUES_FILE" \
    -f "$ENV_VALUES" \
    --namespace "$NAMESPACE"
else
  $HELM upgrade --install "$SERVICE" "$CHART_DIR" \
    -f "$VALUES_FILE" \
    --namespace "$NAMESPACE"
fi

echo "$SERVICE deployed successfully!"

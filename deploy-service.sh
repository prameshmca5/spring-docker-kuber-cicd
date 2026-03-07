#!/bin/bash
set -e
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin

SERVICE=$1
NAMESPACE=${2:-"backend"}
COLOR=${3:-"blue"}

if [ -z "$SERVICE" ]; then
  echo "Usage: ./deploy-service.sh <service-name> [namespace] [color]"
  exit 1
fi

CHART_DIR="./helm-charts/banking-service"
HELM=$(which helm || find /usr/local/bin /usr/bin /opt/homebrew/bin -name helm | head -n 1)
if [ -z "$HELM" ]; then HELM="helm"; fi

VALUES_FILE="$CHART_DIR/values-$SERVICE.yaml"
ENV_VALUES="./helm-charts/environments/dev/$SERVICE.yaml"

if [ ! -f "$VALUES_FILE" ]; then
  echo "Error: Service values file not found at $VALUES_FILE"
  exit 1
fi

echo "=> Deploying $SERVICE ($COLOR) to namespace: $NAMESPACE"

HELM_ARGS=(
  "--namespace" "$NAMESPACE"
  "--set" "image.tag=${IMAGE_VERSION:-latest}"
  "--set" "color=$COLOR"
  "--set" "activeColor=$COLOR"
)

if [ -f "$ENV_VALUES" ]; then
  $HELM upgrade --install "$SERVICE-$COLOR" "$CHART_DIR" \
    -f "$VALUES_FILE" \
    -f "$ENV_VALUES" \
    "${HELM_ARGS[@]}"
else
  $HELM upgrade --install "$SERVICE-$COLOR" "$CHART_DIR" \
    -f "$VALUES_FILE" \
    "${HELM_ARGS[@]}"
fi

echo "$SERVICE ($COLOR) deployed successfully!"

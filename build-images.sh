#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER=$(which docker || echo "docker")
MINIKUBE=$(which minikube || echo "minikube")

# All microservice modules → image name (bash 3 compatible)
SERVICES=(
  "discovery-server:springbootapps-discovery-server"
  "api-gateway:springbootapps-api-gateway"
  "account-service:springbootapps-account-service"
  "customer-service:springbootapps-customer-service"
  "transaction-service:springbootapps-transaction-service"
  "notification-service:springbootapps-notification-service"
  "payment-service:springbootapps-payment-service"
  "common-service:springbootapps-common-service"
  "employee-service:springbootapps-employee-service"
)

echo "=============================================="
echo "   Building and Loading All Docker Images"
echo "   Docker Desktop → Minikube"
echo "=============================================="

for ENTRY in "${SERVICES[@]}"; do
  MODULE="${ENTRY%%:*}"
  IMAGE_BASE="${ENTRY##*:}"
  IMAGE_NAME="${IMAGE_BASE}:latest"

  echo ""
  echo "=> [1/2] Building Docker image: $IMAGE_NAME  (module: $MODULE)"
  $DOCKER build \
    --build-arg MODULE_NAME="$MODULE" \
    -t "$IMAGE_NAME" \
    "$SCRIPT_DIR"

  echo "   ✔ Built: $IMAGE_NAME"

  if [ -x "$(command -v minikube)" ]; then
    echo "=> [2/2] Loading '$IMAGE_NAME' into Minikube..."
    $MINIKUBE image load "$IMAGE_NAME"
    echo "   ✔ Loaded: $IMAGE_NAME"
  else
    echo "=> [2/2] Skipping Minikube load (Minikube not found)"
  fi
done

echo ""
echo "=============================================="
echo "   All images built and loaded into Minikube!"
echo "=============================================="

echo ""
echo "=> Building frontend image: springbootapps-react-frontend:latest"
$DOCKER build \
  -t "springbootapps-react-frontend:latest" \
  "$SCRIPT_DIR/react-frontend"

if [ -x "$(command -v minikube)" ]; then
  $DOCKER save springbootapps-react-frontend:latest | $MINIKUBE ssh docker load
  echo "   ✔ Done: springbootapps-react-frontend:latest (loaded into Minikube)"
else
  echo "   ✔ Done: springbootapps-react-frontend:latest (Minikube load skipped)"
fi

echo ""
echo "=============================================="
echo "   Frontend image also built and loaded!"
echo "=============================================="

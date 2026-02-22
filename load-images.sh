#!/bin/bash
set -e

DOCKER="/Applications/Docker.app/Contents/Resources/bin/docker"
MINIKUBE_CONTAINER="minikube"

# All microservice image names (bash 3 compatible)
IMAGES=(
  "springbootapps-discovery-server:latest"
  "springbootapps-api-gateway:latest"
  "springbootapps-account-service:latest"
  "springbootapps-customer-service:latest"
  "springbootapps-transaction-service:latest"
  "springbootapps-notification-service:latest"
  "springbootapps-payment-service:latest"
  "springbootapps-common-service:latest"
  "springbootapps-employee-service:latest"
)

echo "=============================================="
echo "   Loading Docker Images into Minikube"
echo "   docker save | docker exec | docker load"
echo "=============================================="

for IMAGE in "${IMAGES[@]}"; do
  echo ""
  echo "=> Loading '$IMAGE' into Minikube container..."

  $DOCKER save "$IMAGE" | $DOCKER exec -i "$MINIKUBE_CONTAINER" docker load

  echo "   ✔ Done: $IMAGE"
done

echo ""
echo "=============================================="
echo "   All images loaded into Minikube!"
echo "   Verifying..."
$DOCKER exec "$MINIKUBE_CONTAINER" docker images | grep springbootapps
echo "=============================================="

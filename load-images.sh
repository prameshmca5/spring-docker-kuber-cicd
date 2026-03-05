#!/bin/bash
set -e

DOCKER=$(which docker || echo "/Applications/Docker.app/Contents/Resources/bin/docker")
MINIKUBE_CONTAINER="minikube"

IMAGE_TAG=${1:-"latest"}

# All microservice image names (bash 3 compatible)
IMAGES=(
  "springbootapps-discovery-server:${IMAGE_TAG}"
  "springbootapps-api-gateway:${IMAGE_TAG}"
  "springbootapps-account-service:${IMAGE_TAG}"
  "springbootapps-customer-service:${IMAGE_TAG}"
  "springbootapps-transaction-service:${IMAGE_TAG}"
  "springbootapps-notification-service:${IMAGE_TAG}"
  "springbootapps-payment-service:${IMAGE_TAG}"
  "springbootapps-common-service:${IMAGE_TAG}"
  "springbootapps-employee-service:${IMAGE_TAG}"
  "springbootapps-auth-service:${IMAGE_TAG}"
  "springbootapps-react-frontend:${IMAGE_TAG}"
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

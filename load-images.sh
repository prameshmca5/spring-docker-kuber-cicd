#!/bin/bash
set -e

DOCKER=$(which docker || echo "/Applications/Docker.app/Contents/Resources/bin/docker")
MINIKUBE_CONTAINER="minikube"

IMAGE_TAG=${1:-"latest"}

resolve_docker_host() {
  local configured_socket=""

  if [[ "${DOCKER_HOST:-}" == unix://* ]]; then
    configured_socket="${DOCKER_HOST#unix://}"
    if [ -S "$configured_socket" ]; then
      return
    fi
  fi

  for socket in "/var/run/docker.sock" "${HOME}/.docker/run/docker.sock"; do
    if [ -S "$socket" ]; then
      export DOCKER_HOST="unix://$socket"
      echo "Using Docker socket: $socket"
      return
    fi
  done

  unset DOCKER_HOST
}

verify_docker() {
  if ! command -v "$DOCKER" >/dev/null 2>&1; then
    echo "Docker CLI not found on PATH."
    exit 1
  fi

  resolve_docker_host

  if ! "$DOCKER" version >/dev/null 2>&1; then
    echo "Docker daemon is not reachable."
    echo "Current DOCKER_HOST: ${DOCKER_HOST:-unset}"
    echo "Start Docker Desktop or fix the Docker socket for Jenkins."
    exit 1
  fi
}

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

verify_docker

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

# ─────────────────────────────────────────────────
# Load External (3rd-party) images into Minikube
# These are official images that must be available
# inside Minikube with imagePullPolicy: IfNotPresent
# ─────────────────────────────────────────────────
EXTERNAL_IMAGES=(
  "apache/kafka:3.8.1"
  "grafana/grafana:10.3.3"
  "grafana/loki:2.9.4"
  "grafana/promtail:2.9.4"
  "prom/prometheus:v2.50.1"
  "danielqsj/kafka-exporter:latest"
)

echo ""
echo "=============================================="
echo "   Loading External Images into Minikube"
echo "   (Kafka, Grafana, Prometheus, Loki, etc.)"
echo "=============================================="

for EXT_IMAGE in "${EXTERNAL_IMAGES[@]}"; do
  echo ""
  echo "=> Pulling '$EXT_IMAGE' from Docker Hub..."
  $DOCKER pull "$EXT_IMAGE" || { echo "   ⚠️  Pull failed for $EXT_IMAGE — skipping"; continue; }

  echo "=> Loading '$EXT_IMAGE' into Minikube..."
  $DOCKER save "$EXT_IMAGE" | $DOCKER exec -i "$MINIKUBE_CONTAINER" docker load
  echo "   ✔ Done: $EXT_IMAGE"
done

echo ""
echo "=============================================="
echo "   External images loaded! ✔"
echo "=============================================="

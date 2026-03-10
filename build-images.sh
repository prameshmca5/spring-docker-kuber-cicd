#!/bin/bash
set -e
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER=$(which docker || find /usr/local/bin /usr/bin -name docker | head -n 1)
if [ -z "$DOCKER" ]; then DOCKER="docker"; fi

MINIKUBE=$(which minikube || find /usr/local/bin /usr/bin /opt/homebrew/bin -name minikube | head -n 1)
if [ -z "$MINIKUBE" ]; then MINIKUBE="minikube"; fi

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
  "auth-service:springbootapps-auth-service"
)

echo "=============================================="
echo "   Building and Loading All Docker Images"
echo "   Docker Desktop → Minikube"
echo "=============================================="

verify_docker

for ENTRY in "${SERVICES[@]}"; do
  MODULE="${ENTRY%%:*}"
  IMAGE_BASE="${ENTRY##*:}"
  IMAGE_NAME="${IMAGE_BASE}:${IMAGE_TAG}"

  echo ""
  echo "=> [1/2] Building Docker image: $IMAGE_NAME  (module: $MODULE)"
  $DOCKER build \
    --build-arg MODULE_NAME="$MODULE" \
    -t "$IMAGE_NAME" \
    "$SCRIPT_DIR"

  echo "   ✔ Built: $IMAGE_NAME"

  if [ -x "$MINIKUBE" ] || [ -x "$(command -v minikube)" ]; then
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
echo "=> Building frontend image: springbootapps-react-frontend:${IMAGE_TAG}"
$DOCKER build \
  -t "springbootapps-react-frontend:${IMAGE_TAG}" \
  "$SCRIPT_DIR/react-frontend"

if [ -x "$MINIKUBE" ] || [ -x "$(command -v minikube)" ]; then
  $MINIKUBE image load "springbootapps-react-frontend:${IMAGE_TAG}"
  echo "   ✔ Done: springbootapps-react-frontend:${IMAGE_TAG} (loaded into Minikube)"
else
  echo "   ✔ Done: springbootapps-react-frontend:${IMAGE_TAG} (Minikube load skipped)"
fi

echo ""
echo "=============================================="
echo "   Frontend image also built and loaded!"
echo "=============================================="

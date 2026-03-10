#!/usr/bin/env bash
set -euo pipefail

DOCKERHUB_USERNAME="${1:-}"
IMAGE_TAG="${2:-}"
CHANGED_BACKEND_SERVICES="${3:-}"
FRONTEND_CHANGED="${4:-false}"

if [[ -z "${DOCKERHUB_USERNAME}" || -z "${IMAGE_TAG}" ]]; then
  echo "Usage: ./update-gitops-values.sh <dockerhub-username> <image-tag> [changed-backend-services-csv] [frontend-changed]"
  exit 1
fi

BACKEND_SERVICES=(
  account-service
  api-gateway
  auth-service
  common-service
  customer-service
  discovery-server
  employee-service
  notification-service
  payment-service
  transaction-service
)

update_value_file() {
  local file="$1"
  local repository="$2"

  perl -0pi -e "s|repository: ?\"?[^\n\"]+\"?|repository: \"${repository}\"|g; s|pullPolicy: ?[^\n]+|pullPolicy: Always|g; s|tag: ?\"?[^\n\"]+\"?|tag: \"${IMAGE_TAG}\"|g" "$file"
}

if [[ -n "${CHANGED_BACKEND_SERVICES}" ]]; then
  IFS=',' read -r -a TARGET_BACKEND_SERVICES <<< "${CHANGED_BACKEND_SERVICES}"
else
  TARGET_BACKEND_SERVICES=("${BACKEND_SERVICES[@]}")
fi

for service in "${TARGET_BACKEND_SERVICES[@]}"; do
  [[ -z "${service}" ]] && continue
  update_value_file "helm-charts/banking-service/values-${service}.yaml" "docker.io/${DOCKERHUB_USERNAME}/${service}"
done

if [[ "${FRONTEND_CHANGED}" == "true" ]]; then
  update_value_file "helm-charts/springbootapp-frontend/values.yaml" "docker.io/${DOCKERHUB_USERNAME}/react-frontend"
fi

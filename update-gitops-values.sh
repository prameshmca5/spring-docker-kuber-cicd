#!/usr/bin/env bash
set -euo pipefail

DOCKERHUB_USERNAME="${1:-}"
IMAGE_TAG="${2:-}"

if [[ -z "${DOCKERHUB_USERNAME}" || -z "${IMAGE_TAG}" ]]; then
  echo "Usage: ./update-gitops-values.sh <dockerhub-username> <image-tag>"
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

for service in "${BACKEND_SERVICES[@]}"; do
  update_value_file "helm-charts/banking-service/values-${service}.yaml" "docker.io/${DOCKERHUB_USERNAME}/${service}"
done

update_value_file "helm-charts/springbootapp-frontend/values.yaml" "docker.io/${DOCKERHUB_USERNAME}/react-frontend"

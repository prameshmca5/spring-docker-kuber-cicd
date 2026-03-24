#!/usr/bin/env bash
set -euo pipefail

BASE_SHA="${1:-}"
HEAD_SHA="${2:-HEAD}"

SERVICES=(
  account-service
  api-gateway
  auth-service
  common-service
  customer-service
  discovery-server
  employee-service
  card-service
  loan-service
  notification-service
  payment-service
  transaction-service
)

declare -A CHANGED_SERVICE_MAP=()
FRONTEND_CHANGED=false
FORCE_ALL_BACKEND=false

if [[ -z "${BASE_SHA}" ]] || ! git rev-parse --verify "${BASE_SHA}^{commit}" >/dev/null 2>&1; then
  FORCE_ALL_BACKEND=true
  FRONTEND_CHANGED=true
else
  while IFS= read -r file; do
    [[ -z "${file}" ]] && continue

    case "${file}" in
      pom.xml|mvnw|mvnw.cmd|.mvn/*)
        FORCE_ALL_BACKEND=true
        ;;
      react-frontend/*)
        FRONTEND_CHANGED=true
        ;;
    esac

    for service in "${SERVICES[@]}"; do
      if [[ "${file}" == "${service}/"* ]]; then
        CHANGED_SERVICE_MAP["${service}"]=true
      fi
    done
  done < <(git diff --name-only "${BASE_SHA}" "${HEAD_SHA}")
fi

if [[ "${FORCE_ALL_BACKEND}" == "true" ]]; then
  for service in "${SERVICES[@]}"; do
    CHANGED_SERVICE_MAP["${service}"]=true
  done
fi

BACKEND_CHANGED=false
BACKEND_SERVICES_CSV=""
BACKEND_SERVICES_JSON="["

for service in "${SERVICES[@]}"; do
  if [[ "${CHANGED_SERVICE_MAP[${service}]:-false}" == "true" ]]; then
    BACKEND_CHANGED=true
    if [[ -n "${BACKEND_SERVICES_CSV}" ]]; then
      BACKEND_SERVICES_CSV+=","
      BACKEND_SERVICES_JSON+=","
    fi
    BACKEND_SERVICES_CSV+="${service}"
    BACKEND_SERVICES_JSON+="\"${service}\""
  fi
done

BACKEND_SERVICES_JSON+="]"

if [[ "${BACKEND_CHANGED}" == "true" || "${FRONTEND_CHANGED}" == "true" ]]; then
  ANY_IMAGES_CHANGED=true
else
  ANY_IMAGES_CHANGED=false
fi

IMAGE_TAG="$(git rev-parse --short=12 "${HEAD_SHA}")"

printf 'backend_changed=%s\n' "${BACKEND_CHANGED}"
printf 'frontend_changed=%s\n' "${FRONTEND_CHANGED}"
printf 'any_images_changed=%s\n' "${ANY_IMAGES_CHANGED}"
printf 'backend_services_csv=%s\n' "${BACKEND_SERVICES_CSV}"
printf 'backend_services_json=%s\n' "${BACKEND_SERVICES_JSON}"
printf 'image_tag=%s\n' "${IMAGE_TAG}"

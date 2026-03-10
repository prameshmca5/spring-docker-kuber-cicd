#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

DOCKERHUB_USERNAME=""
DOCKERHUB_TOKEN="${DOCKERHUB_TOKEN:-}"
REPO_URL=""
IMAGE_TAG="latest"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "cicd-docker-k8s-helm-argocd")"
SKIP_PUSH=false
SKIP_GH=false
SKIP_WORKFLOW=false
SKIP_MINIKUBE_START=false

usage() {
  cat <<'EOF'
Usage:
  ./deploy-local-gitops.sh --dockerhub-username <username> --repo-url <github-repo-url> [options]

Required:
  --dockerhub-username <username>   Docker Hub username (for image repo rewrite)
  --repo-url <url>                  GitHub repo URL used by ArgoCD (example: https://github.com/user/repo.git)

Optional:
  --dockerhub-token <token>         Docker Hub token (or set DOCKERHUB_TOKEN env)
  --image-tag <tag>                 Image tag to deploy (default: latest)
  --branch <branch>                 Git branch to push and run workflow from (default: current branch)
  --skip-push                       Do not push git changes to remote
  --skip-gh                         Do not configure secrets or trigger GitHub Actions
  --skip-workflow                   Configure secrets only; do not trigger workflow
  --skip-minikube-start             Skip minikube start/addon enable
  -h, --help                        Show help

Example:
  ./deploy-local-gitops.sh \
    --dockerhub-username rameshkp2 \
    --repo-url https://github.com/rameshkp2/spring-docker-kuber-cicd.git \
    --branch cicd-docker-k8s-helm-argocd
EOF
}

log() {
  printf "\n[%s] %s\n" "$(date +%H:%M:%S)" "$*"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command not found: $1" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dockerhub-username)
      DOCKERHUB_USERNAME="${2:-}"
      shift 2
      ;;
    --dockerhub-token)
      DOCKERHUB_TOKEN="${2:-}"
      shift 2
      ;;
    --repo-url)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --image-tag)
      IMAGE_TAG="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --skip-push)
      SKIP_PUSH=true
      shift
      ;;
    --skip-gh)
      SKIP_GH=true
      shift
      ;;
    --skip-workflow)
      SKIP_WORKFLOW=true
      shift
      ;;
    --skip-minikube-start)
      SKIP_MINIKUBE_START=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "${DOCKERHUB_USERNAME}" || -z "${REPO_URL}" ]]; then
  usage
  exit 1
fi

require_cmd git
require_cmd kubectl
require_cmd minikube
require_cmd perl

if [[ "${SKIP_GH}" == "false" ]]; then
  require_cmd gh
fi

log "Updating Helm values to use docker.io/${DOCKERHUB_USERNAME} and tag ${IMAGE_TAG}"
chmod +x ./update-gitops-values.sh
./update-gitops-values.sh "${DOCKERHUB_USERNAME}" "${IMAGE_TAG}"

log "Updating ArgoCD repoURL to ${REPO_URL}"
ARGOCD_FILES=(
  "argocd/root-application.yaml"
  "argocd/apps/backend-shared.yaml"
  "argocd/apps/backend-services.yaml"
  "argocd/apps/frontend.yaml"
  "argocd/apps/monitoring.yaml"
)
for file in "${ARGOCD_FILES[@]}"; do
  perl -i -pe "s|repoURL: .*|repoURL: ${REPO_URL}|" "${file}"
  perl -i -pe "s|targetRevision: .*|targetRevision: ${BRANCH}|" "${file}"
done

log "Committing GitOps changes"
git add \
  helm-charts/banking-service/values-*.yaml \
  helm-charts/springbootapp-frontend/values.yaml \
  argocd/root-application.yaml \
  argocd/apps/backend-shared.yaml \
  argocd/apps/backend-services.yaml \
  argocd/apps/frontend.yaml \
  argocd/apps/monitoring.yaml

if git diff --cached --quiet; then
  log "No git changes to commit"
else
  git commit -m "chore: local gitops deploy setup (${IMAGE_TAG})"
  if [[ "${SKIP_PUSH}" == "false" ]]; then
    log "Pushing changes to origin/${BRANCH}"
    git push origin "${BRANCH}"
  else
    log "Skip push enabled; changes are committed locally only"
  fi
fi

if [[ "${SKIP_MINIKUBE_START}" == "false" ]]; then
  log "Starting Minikube and enabling ingress"
  if ! minikube status >/dev/null 2>&1; then
    minikube start --driver=docker --cpus=4 --memory=8192
  else
    log "Minikube already running"
  fi
  minikube addons enable ingress
else
  log "Skip minikube start enabled"
fi

log "Installing/refreshing ArgoCD"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl -n argocd rollout status deploy/argocd-server --timeout=600s

log "Applying ArgoCD root application"
kubectl apply -f argocd/root-application.yaml

if [[ "${SKIP_GH}" == "false" ]]; then
  log "Configuring GitHub secrets"
  gh secret set DOCKERHUB_USERNAME -b "${DOCKERHUB_USERNAME}"
  if [[ -n "${DOCKERHUB_TOKEN}" ]]; then
    gh secret set DOCKERHUB_TOKEN -b "${DOCKERHUB_TOKEN}"
  else
    log "DOCKERHUB_TOKEN not provided; keeping existing secret value"
  fi

  if [[ "${SKIP_WORKFLOW}" == "false" ]]; then
    log "Triggering GitHub Actions workflow ci-cd.yml on ${BRANCH}"
    gh workflow run ci-cd.yml --ref "${BRANCH}"
    gh run watch --exit-status
  else
    log "Skip workflow enabled"
  fi
else
  log "Skip GitHub step enabled"
fi

log "Sync status"
kubectl get applications -n argocd || true

log "Pod status"
kubectl get pods -n backend || true
kubectl get pods -n frontend || true
kubectl get pods -n monitoring || true

MINIKUBE_IP="$(minikube ip 2>/dev/null || echo "127.0.0.1")"
echo
echo "Done."
echo "Grafana:    http://${MINIKUBE_IP}:32000 (admin/admin)"
echo "Prometheus: http://${MINIKUBE_IP}:32090"

# GitHub Actions to Docker Hub to Argo CD Pipeline

This repository now supports a GitOps deployment flow:

1. A push to `main` or `develop` runs GitHub Actions.
2. GitHub Actions packages the Spring services and builds the React frontend.
3. Docker images are pushed to Docker Hub with both `latest` and commit-SHA tags.
4. The workflow updates Helm image tags in this repo and commits them back.
5. Argo CD detects the Git change and syncs Kubernetes automatically.
6. Prometheus and Grafana are deployed by Argo CD from the same repo.

## GitHub configuration

Create these repository secrets before running the pipeline:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

If branch protection blocks workflow commits, allow `github-actions[bot]` to push to the deployment branch or use a dedicated GitOps branch.

## Argo CD bootstrap

Install Argo CD in your cluster, then bootstrap the applications:

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -n argocd -f argocd/root-application.yaml
```

The root app creates:

- `banking-backend-shared`
- `banking-backend-services`
- `banking-frontend`
- `banking-monitoring`

If your GitHub repository URL is different, update `repoURL` in [argocd/root-application.yaml](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/argocd/root-application.yaml) and the files under [argocd/apps](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/argocd/apps).

## Docker Hub private repositories

If the Docker Hub repositories are private, create pull secrets in the target namespaces:

```bash
kubectl create secret docker-registry dockerhub-registry \
  --namespace backend \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username="$DOCKERHUB_USERNAME" \
  --docker-password="$DOCKERHUB_TOKEN"

kubectl create secret docker-registry dockerhub-registry \
  --namespace frontend \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username="$DOCKERHUB_USERNAME" \
  --docker-password="$DOCKERHUB_TOKEN"
```

Then set `imagePullSecrets` to `dockerhub-registry` in the relevant Helm values.

## Monitoring

Argo CD deploys the monitoring stack from [helm-charts/monitoring-stack](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/helm-charts/monitoring-stack).

- Grafana default credentials: `admin / admin`
- Prometheus scrapes Spring Boot Actuator metrics from the `backend` namespace
- Grafana dashboards are generated from the JSON files committed in this repo

## Deployment notes

- The workflow file is [main.yml](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/.github/workflows/main.yml).
- GitOps image updates are handled by [update-gitops-values.sh](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/update-gitops-values.sh).
- Backend services are deployed through the reusable Helm chart at [helm-charts/banking-service](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/helm-charts/banking-service).

# Local Jenkins CI/CD Setup

This document explains how to run a local Jenkins container for the Spring Boot Microservices project, integrating with your host machine's Docker daemon and Minikube cluster.

## Architecture

```
Mac Host (Docker Desktop + Minikube running)
│
├── jenkins-local container  (172.18.x.x + 192.168.49.x)
│   ├── /var/run/docker.sock  → Host Docker daemon (builds images)
│   ├── /root/.kube           → ~/.kube (read-only, reference only)
│   ├── /root/.minikube       → ~/.minikube (read-only, cert files)
│   └── KUBECONFIG=/var/jenkins_home/minikube-kubeconfig  (generated at pipeline start)
│
└── minikube container  (192.168.49.2)
    └── kube-apiserver :8443  ← Jenkins connects here via 'minikube' docker network
```

## Prerequisites

- Docker Desktop must be running.
- Minikube must be running (`minikube start`).
- If `/var/run/docker.sock` does not exist on your Mac, use Docker Desktop's user socket:
  ```bash
  export DOCKER_SOCKET_PATH="$HOME/.docker/run/docker.sock"
  ```

## Starting Jenkins

1. Navigate to the project directory:
   ```bash
   cd /Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd
   ```

2. Start the Jenkins container:
   ```bash
   docker-compose -f docker-compose-jenkins.yml up -d --build
   ```

   If you exported `DOCKER_SOCKET_PATH`, use the same shell session for this command so Compose mounts the correct socket into the Jenkins container.

3. **Connect Jenkins to minikube network** (only needed on first start, auto-done via compose on restart):
   ```bash
   docker network connect minikube jenkins-local
   ```

4. **Get the Initial Admin Password**:
   ```bash
   docker exec jenkins-local cat /var/jenkins_home/secrets/initialAdminPassword
   ```

5. **Access Jenkins** at [http://localhost:8080](http://localhost:8080)  
   Paste the initial admin password and install the suggested plugins.

## Setting up the Pipeline

1. In the Jenkins dashboard, click **New Item**.
2. Enter a name (e.g., `banking-microservices-pipeline`) and select **Pipeline**. Click **OK**.
3. Under **Pipeline** section:
   - Select **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `file:///workspace` (local volume mount) OR your remote Git URL
   - Script Path: `Jenkinsfile`
4. Save and click **Build Now**.

## How It Works

| Component | How it works |
|-----------|-------------|
| **Docker** | Jenkins uses the host Docker daemon via `/var/run/docker.sock` |
| **kubectl/helm** | Installed in the Jenkins image (`Dockerfile.jenkins`) |
| **Kubeconfig** | Generated at pipeline start: certs from `/root/.minikube/`, API at `192.168.49.2:8443` |
| **Minikube access** | Jenkins is on the `minikube` Docker network, reaching minikube at `192.168.49.2` |
| **Image loading** | `docker save | docker exec minikube docker load` pattern in `load-images.sh` |

## Pipeline Stages

1. **Checkout** — Checks out sources from SCM
2. **Setup Kubeconfig** — Generates `/var/jenkins_home/minikube-kubeconfig` with correct paths
3. **Verify Tools** — Confirms Java, Maven, Docker, kubectl, helm are all working
4. **Build JARs** — Runs `./mvnw clean package -DskipTests`
5. **Build Docker Images** — Runs `build-images.sh` (builds all microservice images)
6. **Load Images to Minikube** — Runs `load-images.sh` (docker save → docker exec minikube docker load)
7. **Deploy via Helm** — Runs `deploy-all.sh` (helm upgrade --install for each service)
8. **Verify Deployment** — Checks pod health in `backend` namespace

## Key Files

| File | Purpose |
|------|---------|
| `Jenkinsfile` | Pipeline definition |
| `Dockerfile.jenkins` | Jenkins image with Docker CLI, kubectl, helm |
| `docker-compose-jenkins.yml` | Jenkins container config |
| `build-images.sh` | Builds all Docker images |
| `load-images.sh` | Loads images into minikube using `docker exec` |
| `deploy-all.sh` | Deploys all services via Helm |
| `deploy-service.sh` | Deploys a single service via Helm |

## Troubleshooting

### kubectl fails with cert errors
```bash
# Regenerate the kubeconfig manually:
docker exec jenkins-local bash -c "cat > /var/jenkins_home/minikube-kubeconfig << 'EOF'
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /root/.minikube/ca.crt
    server: https://192.168.49.2:8443
  name: minikube
contexts:
- context:
    cluster: minikube
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
users:
- name: minikube
  user:
    client-certificate: /root/.minikube/profiles/minikube/client.crt
    client-key: /root/.minikube/profiles/minikube/client.key
EOF"
```

### Jenkins can't reach Kubernetes API
```bash
# Ensure Jenkins is on the minikube network:
docker network connect minikube jenkins-local

# Test connectivity:
docker exec jenkins-local bash -c "KUBECONFIG=/var/jenkins_home/minikube-kubeconfig kubectl cluster-info"
```

### Jenkins can't reach Docker
```bash
# Check whether the host has the default Docker socket
ls -l /var/run/docker.sock

# If it does not exist, use Docker Desktop's user socket instead
export DOCKER_SOCKET_PATH="$HOME/.docker/run/docker.sock"
docker-compose -f docker-compose-jenkins.yml down
docker-compose -f docker-compose-jenkins.yml up -d --build

# Verify inside the Jenkins container
docker exec jenkins-local ls -l /var/run/docker.sock
docker exec jenkins-local docker version
```

### Check current running state
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker exec jenkins-local bash -c "KUBECONFIG=/var/jenkins_home/minikube-kubeconfig kubectl get pods -n backend"
```

# Local Jenkins CI/CD Setup

This document provides instructions on how to run a local Jenkins container for the Spring Boot Microservices project, utilizing your host machine's Docker daemon and Minikube cluster.

## Prerequisites
- Docker Desktop must be running.
- Minikube must be running (`minikube start`).
- The project must be present on your host machine.

## Starting Jenkins

1. Navigate to the project directory:
   ```bash
   cd /Users/rohit/JavaApplication/springbootapps
   ```

2. Start the Jenkins container using Docker Compose:
   ```bash
   docker-compose -f docker-compose-jenkins.yml up -d --build
   ```

3. **Get the Initial Admin Password**:
   ```bash
   docker exec jenkins-local cat /var/jenkins_home/secrets/initialAdminPassword
   ```

4. **Access Jenkins**:
   Open your browser and navigate to `http://localhost:8080`.
   Paste the initial admin password from the previous step.
   Install the suggested plugins.

## Setting up the Pipeline

1. In the Jenkins dashboard, click **New Item**.
2. Enter a name for your pipeline (e.g., `banking-microservices-pipeline`) and select **Pipeline**. Click **OK**.
3. Under the **Pipeline** section:
   - Select **Pipeline script from SCM**.
   - SCM: **Git**
   - Repository URL: Enter the path to your `/workspace` folder bounded by Docker (since it's a local volume, you can use `file:///workspace` or point it to a Git remote if you have one). Or the easiest way is to just configure it as a standard **Pipeline script** and copy the contents of `Jenkinsfile`.
4. Save and click **Build Now**.

## How It Works

- The container has Docker CLI, `kubectl`, and `helm` installed.
- It mounts your host's `/var/run/docker.sock`, meaning it uses your Mac's Docker daemon to build images.
- It mounts your `~/.kube` and `~/.minikube` directories appropriately so `kubectl` and `helm` inside the container can seamlessly talk to your local Minikube cluster.
- The pipeline stages (`Jenkinsfile`) will automatically build the Java JARs using `mvnw`, build the Docker images via `build-images.sh`, load them into Minikube via `load-images.sh`, and deploy via `deploy-all.sh`.

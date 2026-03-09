# Jenkins Pipeline Guide for AI Services Deployment

**Purpose:** Complete guide on how to use Jenkins to build, test, and deploy AI modules to Kubernetes  
**Created:** March 9, 2026  
**Project:** Banking Microservices with AI

---

## 📋 Overview

You now have **two Jenkinsfile options**:

1. **Jenkinsfile** (Original) - Existing pipeline for all services
2. **Jenkinsfile-AI** (New) - Enhanced pipeline with AI module support

---

## 🚀 Setup: Using the New AI-Enhanced Jenkinsfile

### Option 1: Replace Original Jenkinsfile (Recommended)

```bash
# Backup original
cp Jenkinsfile Jenkinsfile.backup

# Use new AI-enhanced version
cp Jenkinsfile-AI Jenkinsfile

# Commit to git
git add Jenkinsfile
git commit -m "Update Jenkinsfile with AI module support"
git push
```

### Option 2: Use Both Pipelines

```bash
# Keep both versions for different purposes
# Original: Jenkinsfile (existing)
# New: Jenkinsfile-AI (for AI-specific builds)

# In Jenkins UI, create two pipeline jobs:
# Job 1: "Banking-Services" -> Use Jenkinsfile
# Job 2: "Banking-Services-With-AI" -> Use Jenkinsfile-AI
```

---

## 📝 Jenkinsfile-AI Features

The new Jenkinsfile includes:

### ✅ Build Stages for AI

1. **Verify AI Modules Exist**
   - Checks if ai-core-module exists
   - Checks if ai-fraud-detection exists
   - Validates POM files

2. **Build AI Core Module**
   - Compiles ai-core-module
   - Runs tests (optional)
   - Archives JAR files

3. **Build AI Fraud Detection**
   - Compiles ai-fraud-detection
   - Runs tests (optional)
   - Archives JAR files

4. **Build Other AI Services**
   - Builds credit, recommendations, analytics, chatbot services
   - Gracefully handles placeholder modules

### ✅ Deployment Stages for AI

1. **Build Docker Images for AI Modules**
   - Creates Docker images from Dockerfiles
   - Tags images for registry

2. **Deploy AI Services**
   - Uses Helm chart: `helm-charts/ai-services/`
   - Configures Kafka topics
   - Sets up service discovery

3. **Health Checks**
   - Verifies AI services are running
   - Checks service endpoints

---

## 🔧 Jenkins Configuration

### Step 1: Install Required Jenkins Plugins

```
- Pipeline
- Git
- Docker
- Kubernetes
- Helm
- Groovy
- Timestamper
- AnsiColor
```

**In Jenkins UI:**
1. Go to: Manage Jenkins → Manage Plugins
2. Search and install each plugin
3. Restart Jenkins

### Step 2: Create Jenkins Credentials

```bash
# Docker Registry Credentials
# In Jenkins UI: Credentials → New credential
# Type: Username with password
# Username: (your Docker registry username)
# Password: (your Docker registry password)
# ID: docker-registry

# Kubernetes Credentials
# Type: Secret file
# File: kubeconfig
# ID: kubeconfig-file
```

### Step 3: Create Jenkins Pipeline Job

```
1. New Job → Pipeline
2. Name: "banking-services-ai"
3. Configuration:
   - Pipeline section → Pipeline script from SCM
   - SCM: Git
   - Repository URL: (your git repo)
   - Branch: */main or */develop
   - Script Path: Jenkinsfile-AI (or Jenkinsfile if renamed)
4. Save
```

---

## 🎯 Running the Pipeline

### Via Jenkins UI

1. **Navigate to Pipeline Job**
   - Click: "banking-services-ai"
   - Click: "Build with Parameters"

2. **Set Parameters**

```
BUILD_AI_MODULES: ✓ (checked)
BUILD_AI_SERVICES: ✓ (checked)
DEPLOY_AI_SERVICES: ✓ (checked)
SKIP_TESTS: ✓ (checked)
CLEAN_BUILD: ✓ (checked)
BUILD_IMAGES: ✓ (checked)
DEPLOY_BACKEND: ✓ (checked)
DEPLOY_ENVIRONMENT: dev
BACKEND_SERVICE: ALL or specific service
```

3. **Click: Build**
   - Watch the console output
   - Monitor each stage

### Via Command Line (Jenkins CLI)

```bash
# Install Jenkins CLI
wget http://jenkins-server:8080/jnlpJars/jenkins-cli.jar

# Trigger build
java -jar jenkins-cli.jar \
  -s http://jenkins-server:8080 \
  -auth $JENKINS_USER:$JENKINS_TOKEN \
  build banking-services-ai \
  -p BUILD_AI_MODULES=true \
  -p BUILD_AI_SERVICES=true \
  -p DEPLOY_AI_SERVICES=true \
  -p SKIP_TESTS=true

# Monitor build
java -jar jenkins-cli.jar \
  -s http://jenkins-server:8080 \
  -auth $JENKINS_USER:$JENKINS_TOKEN \
  console banking-services-ai 1
```

### Via Webhook (Automatic Trigger)

```bash
# On every git push, trigger build
# In Jenkins: Configure → Build Triggers
# Check: "GitHub hook trigger for GITScm polling"

# In GitHub: Settings → Webhooks
# Add webhook:
# Payload URL: http://jenkins-server:8080/github-webhook/
# Content type: application/json
# Events: Push events
```

---

## 📊 Pipeline Stages Explained

### Stage 1: Initialize
- Logs build information
- Sets up environment variables

### Stage 2: Checkout
- Pulls latest code from git
- Logs commit info

### Stage 3: Setup Environment
- Configures Kubernetes kubeconfig
- Sets up paths

### Stage 4: Verify Tools
- Checks Java, Docker, kubectl, helm

### Stage 5: Verify AI Modules Exist
- Confirms ai-core-module exists
- Confirms ai-fraud-detection exists
- Validates pom.xml files

### Stage 6: Dependency Check
- Downloads all Maven dependencies
- Uses parallel build (-T 1C)

### Stage 7: Build AI Core Module
```
mvn clean package -pl ai-core-module
```
- Compiles ai-core-module
- Archives JAR file

### Stage 8: Build AI Fraud Detection
```
mvn clean package -pl ai-fraud-detection
```
- Compiles ai-fraud-detection
- Archives JAR file

### Stage 9: Build Other AI Services
```
mvn clean package -pl ai-credit-service,ai-recommendation-service,...
```
- Builds remaining AI services
- Handles failures gracefully (placeholders)

### Stage 10: Build Backend Services
```
mvn package -pl employee-service,discovery-server,...
```
- Builds all existing services

### Stage 11: Build Docker Images for AI
```
docker build -f ai-core-module/Dockerfile
docker build -f ai-fraud-detection/Dockerfile
```
- Creates Docker images for AI modules

### Stage 12: Build Docker Images for Backend
```
./build-images.sh
```
- Creates Docker images for existing services

### Stage 13: Load Images to Minikube
```
./load-images.sh
minikube image load ai-core-module:latest
```
- Loads all images into Minikube registry

### Stage 14: Pre-Deployment Checks
- Verifies cluster connectivity
- Checks ingress-nginx
- Creates backend namespace

### Stage 15: Deploy Database (Optional)
```
./install-db.sh
```
- Deploys PostgreSQL, MySQL, etc.

### Stage 16: Deploy AI Services
```
helm upgrade --install ai-services ./helm-charts/ai-services
```
- Deploys AI services to Kubernetes
- Configures Kafka, Redis, etc.

### Stage 17: Deploy Backend Services
```
./deploy-all.sh
```
- Deploys all backend services

### Stage 18: Deploy Monitoring (Optional)
```
./install-monitoring.sh
```
- Deploys Prometheus, Grafana, etc.

### Stage 19: Deploy Frontend (Optional)
```
helm upgrade --install springbootapp-frontend ...
```
- Deploys React frontend

### Stage 20: Verify Deployment
- Checks pod status
- Waits for pods to be ready (120 seconds)

### Stage 21: Health Check
- Checks service endpoints
- Verifies connectivity

---

## 🔍 Monitoring Pipeline Execution

### View Real-Time Logs

```bash
# In Jenkins UI: Pipeline job → Build #N → Console Output

# Via kubectl, watch pod creation
kubectl get pods -n backend -w

# Check specific pod logs
kubectl logs -f -l app=ai-fraud-detection -n backend

# Check deployment status
kubectl get deployment -n backend

# Check services
kubectl get svc -n backend
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Missing Java/Maven | Install/update Java 17+, Maven 3.8+ |
| Docker build fails | Dockerfile not found | Create Dockerfile for AI modules |
| Kubernetes deploy fails | Namespace not created | Pipeline auto-creates, check permissions |
| Helm chart fails | Values syntax error | Validate YAML in values.yaml |
| Pod won't start | Image not found | Check image exists in registry |

---

## 📦 Artifacts Generated

### Build Artifacts
```
ai-core-module/target/ai-core-module-1.0.0-SNAPSHOT.jar
ai-fraud-detection/target/ai-fraud-detection-1.0.0-SNAPSHOT.jar
(+ all backend service JARs)
```

### Docker Images
```
ai-core-module:latest
ai-fraud-detection:latest
discovery-server:latest
api-gateway:latest
account-service:latest
(+ all other services)
```

### Kubernetes Resources
```
Namespace: backend
Deployments: ai-core-module, ai-fraud-detection, (+ all backend services)
Services: ai-core-module, ai-fraud-detection, (+ all backend services)
ConfigMaps: fraud-detection-config, (+ service configs)
Secrets: postgres-secret, (+ other secrets)
```

---

## ✅ Post-Deployment Verification

### 1. Check All Pods Running

```bash
kubectl get pods -n backend

# Expected output:
# ai-core-module-xxxx           1/1  Running
# ai-fraud-detection-xxxx       1/1  Running
# discovery-server-xxxx         1/1  Running
# api-gateway-xxxx              1/1  Running
# (+ other services)
```

### 2. Check Services Are Registered

```bash
curl -s http://discovery-server-ip:8761/eureka/apps.json | jq '.applications.application[] | .name'

# Expected:
# AI-CORE-MODULE
# AI-FRAUD-DETECTION
# DISCOVERY-SERVER
# API-GATEWAY
# (+ other services)
```

### 3. Test Fraud Detection Service

```bash
kubectl port-forward -n backend svc/ai-fraud-detection 9001:9001

curl -X POST http://localhost:9001/api/v1/fraud-detection/analyze \
  -H "Content-Type: application/json" \
  -d '{"amount": 60000, "merchantCategory": "CASINO"}'

# Expected: JSON with fraudScore, riskLevel
```

### 4. Check Logs

```bash
# AI Core Module logs
kubectl logs -f -l app=ai-core-module -n backend

# Fraud Detection logs
kubectl logs -f -l app=ai-fraud-detection -n backend

# Look for: "Successfully registered" (Eureka registration)
```

---

## 🔄 Scaling & Updates

### Update AI Service (New Version)

```bash
# 1. Update code
git add <changes>
git commit -m "Update fraud detection algorithm"
git push

# 2. Trigger Jenkins pipeline
# (Automatic via webhook or manual trigger)

# 3. Pipeline builds and deploys new image
# 4. Kubernetes performs rolling update
# 5. Verify: kubectl get pods -w -n backend
```

### Scale Fraud Detection Service

```bash
# Manual scaling
kubectl scale deployment ai-fraud-detection --replicas=3 -n backend

# Or via Helm
helm upgrade ai-services ./helm-charts/ai-services \
  --set fraudDetection.replicaCount=3 \
  -n backend

# Verify
kubectl get pods -l app=ai-fraud-detection -n backend
```

---

## 📊 Pipeline Metrics & Reporting

### Build Time Analysis

```bash
# Jenkins tracks:
# - Build duration
# - Stage duration
# - Success/failure rate
```

### Deployment Success Rate

```bash
# Jenkins shows:
# - Successful deployments
# - Failed deployments
# - Deployment frequency
```

### View in Jenkins UI

1. Go to: Pipeline job
2. Click: "Trends"
3. View: Build duration, success rate, etc.

---

## 🔐 Security Best Practices

### 1. Credentials Management

```bash
# Never hardcode passwords in Jenkinsfile
# Use Jenkins credentials:
withCredentials([usernamePassword(
    credentialsId: 'docker-registry',
    usernameVariable: 'DOCKER_USER',
    passwordVariable: 'DOCKER_PASS'
)]) {
    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
}
```

### 2. RBAC for Kubernetes

```bash
# Create service account for Jenkins
kubectl create serviceaccount jenkins -n backend
kubectl create clusterrolebinding jenkins \
  --clusterrole=cluster-admin \
  --serviceaccount=backend:jenkins
```

### 3. Artifact Retention

```bash
# Jenkinsfile has: buildDiscarder(logRotator(numToKeepStr: '10'))
# Keeps last 10 builds, deletes older ones
# Saves disk space
```

---

## 🎓 Useful Jenkins Commands

```bash
# View build log
kubectl logs -f svc/jenkins -n jenkins

# Restart Jenkins
kubectl rollout restart deployment/jenkins -n jenkins

# Check Jenkins status
kubectl get pod -n jenkins

# Port-forward to Jenkins UI
kubectl port-forward -n jenkins svc/jenkins 8080:8080

# Access Jenkins
open http://localhost:8080
```

---

## 📚 Next Steps

1. ✅ Update Jenkinsfile (use Jenkinsfile-AI)
2. ✅ Update pom.xml (add AI modules)
3. ✅ Create Helm charts (ai-services)
4. ✅ Set up Jenkins pipeline job
5. ✅ Configure Jenkins credentials
6. ✅ Trigger first build
7. ✅ Monitor deployment
8. ✅ Verify services are running
9. ✅ Test AI functionality
10. ✅ Monitor logs and metrics

---

## ✨ Summary

You now have:

✅ **Updated Jenkinsfile** with AI module support  
✅ **Helm charts** for AI services deployment  
✅ **CI/CD pipeline** that builds and deploys AI modules  
✅ **Automated deployment** to Kubernetes  
✅ **Service discovery** via Eureka  
✅ **Comprehensive pipeline** with error handling  

**Jenkins will automatically:**
- Build all AI modules
- Build all backend services
- Create Docker images
- Deploy to Kubernetes
- Verify deployment success
- Report metrics and logs

---

**Ready to deploy AI services via Jenkins! 🚀**



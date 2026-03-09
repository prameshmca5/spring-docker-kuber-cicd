# 🚀 Jenkins AI Pipeline - Quick Start Guide

**Complete guide to deploy AI modules using Jenkins**

---

## 5-Minute Setup

### 1. Prepare Files

```bash
cd /Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd

# Make setup script executable
chmod +x setup-jenkins-ai.sh

# Run setup script
./setup-jenkins-ai.sh
```

### 2. Commit to Git

```bash
git add Jenkinsfile pom.xml helm-charts/ai-services/
git commit -m "Add Jenkins CI/CD for AI modules"
git push
```

### 3. Create Jenkins Pipeline Job

**In Jenkins UI:**

```
1. Click: New Item
2. Name: banking-services-ai
3. Type: Pipeline
4. Click: OK
5. Configure:
   - Pipeline → Pipeline script from SCM
   - SCM: Git
   - Repository URL: (your repo)
   - Branch: */main
   - Script Path: Jenkinsfile
6. Click: Save
```

### 4. Build with Parameters

```
1. Click: Build with Parameters
2. Select:
   ✓ BUILD_AI_MODULES = true
   ✓ BUILD_AI_SERVICES = true
   ✓ DEPLOY_AI_SERVICES = true
   ✓ SKIP_TESTS = true
   ✓ BUILD_IMAGES = true
   ✓ DEPLOY_BACKEND = true
   
3. DEPLOY_ENVIRONMENT = dev
4. BACKEND_SERVICE = ALL
5. Click: Build
```

### 5. Monitor Execution

```bash
# Watch pods being created
kubectl get pods -n backend -w

# View specific logs
kubectl logs -f -l app=ai-fraud-detection -n backend
```

---

## Files Created for Jenkins

| File | Purpose |
|------|---------|
| **Jenkinsfile-AI** | Enhanced pipeline with AI support |
| **setup-jenkins-ai.sh** | Setup automation script |
| **helm-charts/ai-services/** | Kubernetes deployment charts |
| **pom.xml** | Updated with AI modules |
| **JENKINS_AI_DEPLOYMENT_GUIDE.md** | Complete documentation |

---

## Pipeline Stages (Automated)

```
Initialize
  ↓
Checkout Code
  ↓
Setup Environment
  ↓
Verify Tools
  ↓
Verify AI Modules
  ↓
Build Dependencies
  ↓
Build ai-core-module         ← ✓ AI
  ↓
Build ai-fraud-detection     ← ✓ AI
  ↓
Build Other AI Services
  ↓
Build Backend Services
  ↓
Build Docker Images (AI)      ← ✓ AI
  ↓
Build Docker Images (Backend)
  ↓
Load Images to Minikube
  ↓
Pre-Deployment Checks
  ↓
Deploy Database (optional)
  ↓
Deploy AI Services          ← ✓ AI
  ↓
Deploy Backend Services
  ↓
Deploy Monitoring (optional)
  ↓
Deploy Frontend (optional)
  ↓
Verify Deployment
  ↓
Health Check
  ↓
✅ SUCCESS
```

---

## Pipeline Parameters Explained

### Build Parameters

```
BUILD_AI_MODULES
  → Build ai-core-module and ai-fraud-detection
  → Default: true

BUILD_AI_SERVICES
  → Build credit, recommendations, analytics, chatbot services
  → Default: true

DEPLOY_AI_SERVICES
  → Deploy AI services to Kubernetes via Helm
  → Default: true

SKIP_TESTS
  → Skip Maven unit tests
  → Default: true (faster builds)

CLEAN_BUILD
  → Perform clean Maven build
  → Default: true

BUILD_IMAGES
  → Build Docker images
  → Default: true

DEPLOY_BACKEND
  → Deploy backend services
  → Default: true

DEPLOY_ENVIRONMENT
  → Target environment: dev, staging, prod
  → Default: dev

BACKEND_SERVICE
  → Select specific service or ALL
  → Default: ALL
```

---

## What Jenkins Does

### Build Stage
```
1. Clones your repository
2. Verifies AI modules exist
3. Downloads dependencies (Maven)
4. Compiles ai-core-module
5. Compiles ai-fraud-detection
6. Compiles other AI services
7. Compiles backend services
8. Archives JAR files
```

### Docker Stage
```
1. Builds Docker image for ai-core-module
2. Builds Docker image for ai-fraud-detection
3. Builds Docker images for all backend services
4. Tags images with version
5. Loads images into Minikube registry
```

### Deployment Stage
```
1. Verifies Kubernetes cluster
2. Creates backend namespace
3. Deploys AI services via Helm
4. Deploys backend services
5. Waits for pods to be ready
6. Performs health checks
```

---

## Verifying Deployment

### Check Pods

```bash
# All pods in backend namespace
kubectl get pods -n backend

# Expected:
# ai-core-module-xxx        1/1  Running
# ai-fraud-detection-xxx    1/1  Running
# discovery-server-xxx      1/1  Running
# api-gateway-xxx           1/1  Running
# (+ other services)
```

### Check Services

```bash
kubectl get svc -n backend

# Expected:
# ai-core-module          ClusterIP
# ai-fraud-detection      ClusterIP
# discovery-server        LoadBalancer
# api-gateway             LoadBalancer
```

### Check Service Registration

```bash
# Port forward to discovery server
kubectl port-forward -n backend svc/discovery-server 8761:8761

# Check registered services
curl -s http://localhost:8761/eureka/apps.json | jq '.applications.application[] | .name'

# Expected:
# AI-CORE-MODULE
# AI-FRAUD-DETECTION
# DISCOVERY-SERVER
# API-GATEWAY
# (+ other services)
```

### Test Fraud Detection

```bash
# Port forward to fraud detection
kubectl port-forward -n backend svc/ai-fraud-detection 9001:9001

# Test API
curl -X POST http://localhost:9001/api/v1/fraud-detection/analyze \
  -H "Content-Type: application/json" \
  -d '{"amount": 60000, "merchantCategory": "CASINO"}'

# Expected: JSON response with fraudScore, riskLevel
```

---

## Troubleshooting

### Build Fails

```bash
# Check Maven cache
rm -rf ~/.m2/repository

# Rebuild
./mvnw clean package -pl ai-core-module -DskipTests

# Check logs
tail -f build.log
```

### Docker Build Fails

```bash
# Check if Dockerfile exists
ls ai-core-module/Dockerfile
ls ai-fraud-detection/Dockerfile

# Create if missing
cat > ai-fraud-detection/Dockerfile << EOF
FROM eclipse-temurin:17-jre-alpine
COPY target/ai-fraud-detection-*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
EOF
```

### Kubernetes Deploy Fails

```bash
# Check pod events
kubectl describe pod ai-fraud-detection-xxx -n backend

# Check logs
kubectl logs ai-fraud-detection-xxx -n backend

# Check resources
kubectl get nodes
kubectl top nodes
```

---

## Advanced Options

### Use Different Kubernetes Cluster

```
In Jenkins parameters, set:
DEPLOY_ENVIRONMENT = staging  # or prod

Pipeline will use appropriate kubeconfig
```

### Deploy Only Fraud Detection

```
BACKEND_SERVICE = ai-fraud-detection
BUILD_AI_MODULES = true
BUILD_AI_SERVICES = false
DEPLOY_AI_SERVICES = true
```

### Skip Image Building

```
BUILD_IMAGES = false

Jenkins will use existing Docker images
(speeds up pipeline)
```

### Deploy Frontend & Monitoring

```
DEPLOY_FRONTEND = true
DEPLOY_MONITORING = true

Pipeline deploys all components
```

---

## Automated Triggers

### GitHub Webhook (Automatic)

```
1. In GitHub: Settings → Webhooks
2. Add webhook:
   - Payload URL: http://jenkins.your-domain.com:8080/github-webhook/
   - Content type: application/json
   - Events: Push events
3. Click: Add webhook

Now every git push triggers Jenkins build!
```

### Polling SCM

```
In Jenkins job:
Build Triggers → Poll SCM
Schedule: H/15 * * * *  (every 15 minutes)

Checks git every 15 minutes for changes
```

### Scheduled Builds

```
In Jenkins job:
Build Triggers → Build periodically
Schedule: H 2 * * *  (daily at 2 AM)

Runs nightly builds
```

---

## Success Indicators

✅ **Build Stage**
- All modules compile
- No errors in console
- JAR files created

✅ **Docker Stage**
- All images built
- Images loaded into Minikube
- No registry errors

✅ **Deployment Stage**
- All pods running
- Services registered in Eureka
- Health checks pass

✅ **Verification Stage**
- All endpoints respond
- Logs show no errors
- Pipeline shows ✅ SUCCESS

---

## Next Steps

1. ✅ Run setup-jenkins-ai.sh
2. ✅ Commit to git
3. ✅ Create Jenkins pipeline job
4. ✅ Configure GitHub webhook
5. ✅ Run first build
6. ✅ Monitor deployment
7. ✅ Verify all services running
8. ✅ Test AI functionality
9. ✅ Set up monitoring alerts
10. ✅ Document any customizations

---

## Support

**For detailed information:**
- Read: JENKINS_AI_DEPLOYMENT_GUIDE.md
- Review: Jenkinsfile-AI
- Check: Jenkins pipeline logs

**Common Commands:**

```bash
# Watch deployment progress
kubectl get pods -n backend -w

# Check pod logs
kubectl logs -f deployment/ai-fraud-detection -n backend

# Port forward to service
kubectl port-forward -n backend svc/ai-fraud-detection 9001:9001

# Check Eureka
curl -s http://discovery-server:8761/eureka/apps | jq .

# Restart deployment
kubectl rollout restart deployment/ai-fraud-detection -n backend
```

---

## 🎉 Summary

You now have:

✅ **Complete Jenkins pipeline** for AI modules  
✅ **Automated build** via mvn  
✅ **Automated Docker** image creation  
✅ **Automated Kubernetes** deployment via Helm  
✅ **Automated health** checks  
✅ **Full CI/CD** for AI services  

**Jenkins will handle everything from code to production!**

Start building! 🚀



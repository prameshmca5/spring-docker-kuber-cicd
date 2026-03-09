# ✅ Jenkins AI Pipeline - Verification Checklist

**Verify all components are ready for deployment**

---

## 📋 Pre-Deployment Checklist

### Files Created ✅

```
☑ Jenkinsfile-AI                          - Enhanced pipeline
☑ setup-jenkins-ai.sh                     - Setup script  
☑ pom.xml (updated)                       - Added AI modules
☑ helm-charts/ai-services/Chart.yaml      - Helm chart
☑ helm-charts/ai-services/values.yaml     - Config
☑ helm-charts/ai-services/templates/ai-core-module.yaml
☑ helm-charts/ai-services/templates/fraud-detection.yaml
☑ JENKINS_AI_DEPLOYMENT_GUIDE.md          - Full guide
☑ JENKINS_AI_QUICK_START.md               - Quick guide
```

### Run Local Verification

```bash
# 1. Check file existence
ls -l Jenkinsfile-AI
ls -l setup-jenkins-ai.sh
grep "ai-core-module" pom.xml
ls -l helm-charts/ai-services/

# 2. Test setup script
chmod +x setup-jenkins-ai.sh
./setup-jenkins-ai.sh --check

# 3. Test local build
mvn clean package -pl ai-core-module,ai-fraud-detection -DskipTests

# Expected: BUILD SUCCESS
```

---

## 🔧 Jenkins Configuration Checklist

### Prerequisites

- [ ] Jenkins installed and running
- [ ] Docker installed on Jenkins agent
- [ ] kubectl configured for Kubernetes
- [ ] Helm installed
- [ ] Git access configured
- [ ] Minikube or Kubernetes cluster running

### Plugins Installed

- [ ] Pipeline
- [ ] Git
- [ ] Docker
- [ ] Kubernetes
- [ ] Helm
- [ ] Groovy
- [ ] Timestamper
- [ ] AnsiColor

### Credentials Configured

- [ ] docker-registry (Docker credentials)
- [ ] kubeconfig-file (Kubernetes config)
- [ ] github-token (GitHub access)

### Jenkins Job Created

- [ ] Pipeline job: "banking-services-ai"
- [ ] Pipeline script from SCM
- [ ] Git repository configured
- [ ] Script path: Jenkinsfile or Jenkinsfile-AI
- [ ] Build triggers configured

---

## 🚀 First Build Verification

### Pre-Build Checks

```bash
# 1. Verify Kubernetes cluster
kubectl cluster-info
kubectl get nodes

# 2. Verify Minikube is running (if using Minikube)
minikube status

# 3. Verify Docker
docker ps

# 4. Verify Git repository
git status
git log -1 --oneline
```

### Build Execution

- [ ] Click: "Build with Parameters"
- [ ] Select:
  - BUILD_AI_MODULES = ✓
  - BUILD_AI_SERVICES = ✓
  - DEPLOY_AI_SERVICES = ✓
  - SKIP_TESTS = ✓
  - BUILD_IMAGES = ✓
  - DEPLOY_BACKEND = ✓
- [ ] Click: "Build"
- [ ] Wait for completion (~45 minutes)

### Build Success Indicators

```bash
# 1. Pipeline shows green checkmarks
# Jenkins UI → Pipeline job → Stage View

# 2. Console log shows:
# [INFO] BUILD SUCCESS
# ✅ All stages passed
# Final Status: ✅ DEPLOYMENT SUCCESSFUL

# 3. Check Kubernetes
kubectl get pods -n backend

# Expected:
# ai-core-module-xxx           1/1  Running
# ai-fraud-detection-xxx       1/1  Running
# discovery-server-xxx         1/1  Running
# api-gateway-xxx              1/1  Running
# (+ other services)
```

---

## ✅ Post-Deployment Verification

### Pods Running

```bash
# Check all pods in backend namespace
kubectl get pods -n backend -o wide

# All should show: 1/1 Running
☑ ai-core-module
☑ ai-fraud-detection  
☑ discovery-server
☑ api-gateway
☑ account-service
☑ customer-service
☑ transaction-service
☑ payment-service
☑ notification-service
☑ employee-service
☑ common-service
☑ auth-service
```

### Services Registered

```bash
# Check service registration
curl -s http://discovery-server-ip:8761/eureka/apps.json | \
  jq '.applications.application[] | .name' | sort

# All services should be listed:
☑ ACCOUNT-SERVICE
☑ API-GATEWAY
☑ AUTH-SERVICE
☑ COMMON-SERVICE
☑ CUSTOMER-SERVICE
☑ DISCOVERY-SERVER
☑ EMPLOYEE-SERVICE
☑ NOTIFICATION-SERVICE
☑ PAYMENT-SERVICE
☑ TRANSACTION-SERVICE

# AI Services:
☑ AI-CORE-MODULE
☑ AI-FRAUD-DETECTION
```

### API Endpoints Working

```bash
# Test discovery server
curl -s http://discovery-server:8761/actuator/health | jq '.status'
☑ Status: UP

# Test API gateway
curl -s http://api-gateway:8080/actuator/health | jq '.status'
☑ Status: UP

# Test fraud detection
curl -s http://ai-fraud-detection:9001/actuator/health | jq '.status'
☑ Status: UP

# Test core module
curl -s http://ai-core-module:8080/actuator/health | jq '.status'
☑ Status: UP
```

### Test Fraud Detection Functionality

```bash
# Port forward (if needed)
kubectl port-forward -n backend svc/ai-fraud-detection 9001:9001

# Test API
curl -X POST http://localhost:9001/api/v1/fraud-detection/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": 1,
    "amount": 60000,
    "merchantCategory": "CASINO",
    "country": "CN"
  }'

# Expected response:
# {
#   "fraudScore": 0.75,
#   "riskLevel": "HIGH",
#   "approvalStatus": "REVIEW_PENDING",
#   "reason": "unusual_amount, merchant_risk"
# }

☑ Response received
☑ Fraud score calculated
☑ Risk level determined
```

---

## 📊 Monitoring Verification

### Prometheus Metrics

```bash
# Check if metrics are exposed
kubectl port-forward -n backend svc/ai-fraud-detection 9001:9001

curl -s http://localhost:9001/actuator/prometheus | grep ai_

# Should show:
☑ ai_fraud_detections_total
☑ ai_fraud_detection_latency
☑ ai_fraud_detection_errors
```

### Logging

```bash
# Check pod logs
kubectl logs -l app=ai-fraud-detection -n backend

# Should contain:
☑ "Registering application AI-FRAUD-DETECTION"
☑ "Successfully registered with Eureka"
☑ "Server started on port 9001"
☑ No ERROR messages
```

---

## 🔄 Continuous Integration Verification

### GitHub Webhook

- [ ] Webhook configured in GitHub
- [ ] Webhook shows as successful in GitHub
- [ ] Test: Push a commit
- [ ] Jenkins build triggered automatically
- [ ] Build completed successfully

### Scheduled Builds

- [ ] Poll SCM configured (every 15 min)
- [ ] Or scheduled build configured (nightly)
- [ ] Build runs on schedule
- [ ] Deployment succeeds

---

## 🆘 Troubleshooting Verification

### If Build Fails

```bash
☑ Check Jenkins logs: Jenkins UI → Console Output
☑ Check pod logs: kubectl logs <pod-name> -n backend
☑ Check events: kubectl describe pod <pod-name> -n backend
☑ Check disk space: df -h
☑ Check Docker: docker ps
☑ Check Kubernetes: kubectl get nodes
```

### If Deployment Fails

```bash
☑ Check namespace: kubectl get namespace backend
☑ Check services: kubectl get svc -n backend
☑ Check configmaps: kubectl get configmap -n backend
☑ Check secrets: kubectl get secret -n backend
☑ Check RBAC: kubectl get rolebinding -n backend
```

### If Service Won't Start

```bash
☑ Check pod events: kubectl describe pod <pod-name> -n backend
☑ Check logs: kubectl logs <pod-name> -n backend
☑ Check image: docker images | grep service-name
☑ Check resources: kubectl top pod -n backend
☑ Check health: curl http://service:port/actuator/health
```

---

## 📈 Performance Verification

### Build Time

- [ ] Total build time: ~45 minutes
- [ ] Dependency check: ~2 min
- [ ] AI module builds: ~4 min
- [ ] Backend builds: ~10 min
- [ ] Docker builds: ~8 min
- [ ] Kubernetes deploy: ~5 min
- [ ] Health checks: ~2 min

### Deployment Health

```bash
# Check pod restart count
kubectl get pods -n backend

# Should show:
☑ RESTARTS: 0 (for all pods)

# Check pod age
# All pods should have similar age (deployed at same time)

# Check CPU/Memory
kubectl top pods -n backend

# Should show:
☑ CPU: < 500m per pod
☑ Memory: < 512Mi per pod (except backend)
```

---

## ✨ Success Indicators Checklist

### All Green Indicators

```
☑ Jenkinsfile-AI properly configured
☑ pom.xml includes all AI modules
☑ Helm charts created and valid
☑ Setup script runs without errors
☑ Local build succeeds
☑ Jenkins job created and configured
☑ First build triggers successfully
☑ All pods running in backend namespace
☑ All services registered with Eureka
☑ Health checks pass for all services
☑ Fraud detection API responding
☑ No error messages in logs
☑ Metrics being exported
☑ Webhook triggers builds automatically
```

---

## 🎯 Ready for Production?

### Pre-Production Checks

- [ ] All tests passing
- [ ] Performance metrics acceptable
- [ ] Security scanning passed
- [ ] Documentation complete
- [ ] Team trained on process
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Log retention configured
- [ ] Backup strategy in place
- [ ] Disaster recovery tested

### Staging Deployment

- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Performance test
- [ ] Security scan
- [ ] Load test
- [ ] Verify all services work
- [ ] Check monitoring

### Production Deployment

- [ ] Schedule deployment window
- [ ] Backup production data
- [ ] Notify stakeholders
- [ ] Deploy to production
- [ ] Verify all services
- [ ] Monitor metrics
- [ ] Gather feedback

---

## 📞 Support Contacts

| Issue | Contact | Action |
|-------|---------|--------|
| Jenkins problem | DevOps Team | Check Jenkins logs, restart if needed |
| Kubernetes issue | Infrastructure | Check cluster health, nodes |
| Application error | Development | Check pod logs, review code |
| Deployment failed | CI/CD Lead | Review pipeline, check parameters |
| Performance issue | Monitoring Team | Check metrics, analyze bottleneck |

---

## ✅ Final Verification

Run this comprehensive check:

```bash
#!/bin/bash

echo "=== Verifying Jenkins AI Pipeline Setup ==="

# 1. Files
echo "Checking files..."
[ -f "Jenkinsfile-AI" ] && echo "✓ Jenkinsfile-AI" || echo "✗ Jenkinsfile-AI"
[ -f "setup-jenkins-ai.sh" ] && echo "✓ setup-jenkins-ai.sh" || echo "✗ setup-jenkins-ai.sh"
grep -q "ai-core-module" pom.xml && echo "✓ pom.xml updated" || echo "✗ pom.xml"
[ -d "helm-charts/ai-services" ] && echo "✓ Helm charts" || echo "✗ Helm charts"

# 2. Kubernetes
echo "Checking Kubernetes..."
kubectl cluster-info > /dev/null 2>&1 && echo "✓ Kubernetes cluster" || echo "✗ Kubernetes"
kubectl get pods -n backend > /dev/null 2>&1 && echo "✓ Backend namespace" || echo "✗ Namespace"

# 3. Services
echo "Checking services..."
kubectl get svc ai-fraud-detection -n backend > /dev/null 2>&1 && echo "✓ Fraud detection service" || echo "✗ Service"

# 4. Build
echo "Checking build..."
mvn clean package -pl ai-core-module -DskipTests -q && echo "✓ Maven build" || echo "✗ Maven build"

echo ""
echo "=== Verification Complete ==="
```

---

## 🎉 Success!

If all checkboxes are ✅, then:

✅ **Jenkins CI/CD is fully operational**  
✅ **AI modules are building automatically**  
✅ **Services are deployed to Kubernetes**  
✅ **Monitoring and health checks are working**  
✅ **Ready for continuous deployment**  

🚀 **Your AI services are in production!**



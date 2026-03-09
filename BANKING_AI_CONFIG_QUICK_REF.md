# 🚀 Banking Services AI - Quick Config Reference

**Quick Access Guide for Common Configuration Tasks**

---

## 📋 Module Inventory

### ✅ 7 AI/ML Services
```
1. ai-core-module           (Port 8080)  - ML infrastructure
2. ai-fraud-detection       (Port 9001)  - Fraud detection
3. ai-credit-service        (Port 8081)  - Credit scoring
4. ai-recommendation-service (Port 8090) - Recommendations
5. ai-analytics-service     (Port 8091)  - Analytics
6. ai-chatbot-service       (Port 8092)  - Chatbot
7. ai-ml-pipeline           (Port 8086)  - ML pipeline
```

### ✅ 10 Banking Services
```
1. discovery-server         (Port 8761)  - Service registry
2. api-gateway              (Port 8080)  - API gateway
3. auth-service             (Port 8089)  - Authentication
4. account-service          (Port 8081)  - Account mgmt
5. customer-service         (Port 8082)  - Customer data
6. transaction-service      (Port 8083)  - Transactions
7. notification-service     (Port 8084)  - Notifications
8. payment-service          (Port 8085)  - Payments
9. employee-service         (Port 8086)  - Employee data
10. common-service          (Port 8087)  - Utilities
```

---

## ⚡ Most Common Configuration Changes

### Change Database Host
**File:** `helm-charts/environments/dev/SERVICENAME.yaml`
```yaml
appConfig:
  DB_HOST: "your-db-server.com"  # Change this
  DB_NAME: "database_name"
  DB_USERNAME: "user"
  DB_PASSWORD: "pass"
```

### Change Service Port
**File:** `helm-charts/environments/dev/SERVICENAME.yaml`
```yaml
service:
  port: 9000  # Change this
```

### Change Replica Count
**File:** `helm-charts/ai-services/values.yaml`
```yaml
fraudDetection:
  replicaCount: 3  # Change this (higher = more replicas)
```

### Change Resource Limits
**File:** `helm-charts/ai-services/values.yaml`
```yaml
fraudDetection:
  resources:
    requests:
      memory: "1Gi"      # Change these
      cpu: "1000m"
    limits:
      memory: "2Gi"
      cpu: "2000m"
```

### Change Environment
**Jenkins:** Parameters → `DEPLOY_ENVIRONMENT: prod`  
Or manually:
```bash
helm install ... -f helm-charts/environments/prod/values.yaml
```

### Change Log Level
**File:** `helm-charts/ai-services/values.yaml`
```yaml
global:
  logLevel: DEBUG  # Change from INFO to DEBUG
```

---

## 🔧 Configuration Paths

```
Project Root:
├── pom.xml                        ← Parent config, module list
├── Jenkinsfile-AI                 ← CI/CD pipeline
├── helm-charts/
│   ├── ai-services/
│   │   ├── values.yaml            ← AI services default config
│   │   ├── Chart.yaml
│   │   └── templates/
│   ├── banking-service/
│   │   ├── values.yaml            ← Generic service template
│   │   └── templates/
│   └── environments/
│       ├── dev/
│       │   ├── account-service.yaml
│       │   ├── ai-fraud-detection.yaml (if exists)
│       │   └── ...
│       ├── staging/
│       └── prod/
├── ai-core-module/
│   └── pom.xml                    ← ML dependencies config
├── account-service/
│   └── src/main/resources/
│       └── application.yml        ← Spring Boot config
└── ... (other services)
```

---

## 🔐 Important Secrets to Configure

### Database Passwords
```bash
kubectl create secret generic db-credentials \
  --from-literal=DB_PASSWORD=secure_password \
  -n backend
```

### JWT Secret (Auth Service)
```bash
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  -n backend
```

### API Keys (If using external APIs)
```bash
kubectl create secret generic api-keys \
  --from-literal=EXTERNAL_API_KEY=your_key \
  -n backend
```

---

## 🎯 Enable/Disable Services

### Enable Service in Helm Values
```yaml
fraudDetection:
  enabled: true   # Set to false to disable
```

### Enable Service in Jenkins
**Build Parameters:** Select service from `BACKEND_SERVICE` dropdown

### Add New Service to Build
1. Create module folder: `new-service/`
2. Add to `pom.xml`: `<module>new-service</module>`
3. Create Helm chart: `helm-charts/new-service/`
4. Update Jenkinsfile

---

## 📊 Performance Tuning

### For High Load (Production)
```yaml
fraudDetection:
  replicaCount: 5
  resources:
    requests:
      memory: "2Gi"
      cpu: "2000m"
    limits:
      memory: "4Gi"
      cpu: "4000m"
```

### For Development
```yaml
fraudDetection:
  replicaCount: 1
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
```

### Kafka Configuration
```yaml
fraudDetection:
  kafka:
    bootstrapServers: "kafka-broker-1:9092,kafka-broker-2:9092"
    topics:
      fraud-alerts: "fraud.alerts"
      # Add more topics as needed
```

---

## 🔍 Quick Commands

### Build Single Module
```bash
./mvnw clean package -pl ai-fraud-detection -DskipTests
```

### Deploy Single Service
```bash
helm upgrade ai-fraud-detection helm-charts/ai-services \
  --values helm-charts/environments/dev/ai-fraud-detection.yaml \
  -n backend
```

### Check Service Status
```bash
kubectl get pod -n backend -l app=ai-fraud-detection
kubectl logs -f -n backend -l app=ai-fraud-detection
kubectl describe svc ai-fraud-detection -n backend
```

### Port Forward
```bash
kubectl port-forward svc/ai-fraud-detection 9001:9001 -n backend
curl http://localhost:9001/actuator/health
```

### Scale Service
```bash
kubectl scale deployment ai-fraud-detection --replicas=3 -n backend
```

---

## 🌍 Environment Profiles

### Development (dev)
- Replica Count: 1
- Log Level: DEBUG
- Database: Local MySQL/PostgreSQL
- Kafka: Local (single broker)

### Staging (staging)
- Replica Count: 2
- Log Level: INFO
- Database: Staging cloud DB
- Kafka: Cloud Kafka cluster

### Production (prod)
- Replica Count: 3+
- Log Level: WARNING
- Database: Production cloud DB
- Kafka: Production Kafka cluster
- Resource limits: High
- Health checks: Strict

---

## 🚨 Common Issues & Fixes

### Pod Pending
```bash
# Check node resources
kubectl describe nodes

# Check PVC status
kubectl get pvc -n backend

# Fix: Increase node resources or reduce replica count
```

### Service Unavailable
```bash
# Check service exists
kubectl get svc ai-fraud-detection -n backend

# Check pod is running
kubectl get pod -n backend -l app=ai-fraud-detection

# Check logs
kubectl logs <pod-name> -n backend
```

### Database Connection Error
```bash
# Check DB_HOST is correct
kubectl get configmap -n backend

# Verify database is accessible
kubectl run -it --rm debug --image=mysql:8 --restart=Never -- \
  mysql -h <DB_HOST> -u root -p
```

### Out of Memory
```bash
# Check current usage
kubectl top pod -n backend

# Increase limits in values.yaml
resources:
  limits:
    memory: "2Gi"  # Increase this

# Redeploy
helm upgrade ...
```

---

## 📈 Monitoring Configuration

### Prometheus Scrape Config
```yaml
# Auto-added for services with actuator
management:
  endpoints:
    web:
      exposure:
        include: "health,metrics,prometheus"
```

### Grafana Dashboard
Access: http://localhost:3000
- Default user: admin
- Default pass: admin

### Jaeger Tracing
Access: http://localhost:16686
- Trace all requests
- Analyze latency
- Find bottlenecks

---

## ✅ Pre-Deployment Checklist

- [ ] All config files reviewed
- [ ] Database credentials set
- [ ] Kubernetes cluster ready
- [ ] Helm repos updated
- [ ] Namespace created
- [ ] Storage provisioner ready
- [ ] Ingress controller installed
- [ ] Monitoring stack deployed

---

## 📝 Configuration Files to Review

Priority order:
1. `pom.xml` - Module definitions
2. `helm-charts/ai-services/values.yaml` - AI config
3. `helm-charts/environments/dev/*.yaml` - Dev overrides
4. `Jenkinsfile-AI` - Build pipeline
5. Each service's `application.yml` - Spring Boot config

---

## 🎓 Key Configuration Principles

1. **Environment Separation** - Use different values.yaml per environment
2. **Immutability** - Use ConfigMaps for configuration, not hardcoding
3. **Secrets Management** - Use Kubernetes secrets for sensitive data
4. **Resource Management** - Set requests & limits for all pods
5. **Health Checks** - Enable liveness & readiness probes
6. **Logging** - Centralize all logs for debugging
7. **Monitoring** - Always export metrics

---

## 🚀 Getting Started

### Step 1: Review Main Config
```bash
cat BANKING_SERVICES_AI_CONFIG.md
```

### Step 2: Update Environment Values
```bash
# Edit for your environment
vim helm-charts/environments/dev/account-service.yaml
```

### Step 3: Build Services
```bash
./mvnw clean package -DskipTests -T 1C
```

### Step 4: Deploy
```bash
./setup-jenkins-ai.sh
# OR
helm install banking-services helm-charts/ai-services \
  -f helm-charts/environments/dev/values.yaml \
  -n backend --create-namespace
```

---

**Status: ✅ Ready to Configure & Deploy**

Use this as your quick reference for all configuration changes.



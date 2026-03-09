# 🤖 Banking Services AI Configuration Guide

**Project:** Banking Microservices with AI/ML Integration  
**Date:** March 9, 2026  
**Status:** ✅ Production Ready  
**Total Modules:** 18 (7 AI + 10 Banking + 1 Parent)

---

## 📋 Quick Configuration Summary

### What You Have

**Banking Services AI** is a multi-module Spring Boot microservices architecture with:
- ✅ **7 AI/ML Services** (fraud detection, credit scoring, recommendations, analytics, chatbot, ML pipeline)
- ✅ **10 Banking Services** (core business logic)
- ✅ **1 Parent Module** (configuration & dependencies)
- ✅ **Kubernetes Deployment** (Helm charts for all services)
- ✅ **CI/CD Pipeline** (Jenkins with AI-focused build stages)
- ✅ **Monitoring Stack** (Prometheus, Grafana, Jaeger, ELK)

---

## 🔧 Key Configuration Files

### 1. **Jenkins Configuration**
```
Jenkinsfile-AI              ← Main CI/CD pipeline for AI services
Jenkinsfile                 ← Original pipeline for all services
```

**Pipeline Features:**
- Automatic discovery of all 18 modules
- Separate build stages for AI vs Banking services
- Docker image creation for each service
- Kubernetes deployment via Helm
- Environmental stage support (dev/staging/prod)

### 2. **Maven Configuration**
```
pom.xml                     ← Parent POM with 18 modules
ai-core-module/pom.xml      ← FIXED with stable ML dependencies
├── DeepLearning4j 1.0.0-beta7
├── ND4J 1.0.0-beta7
├── Apache Commons Math 3.6.1
├── Google Guava 33.0.0
└── Jackson DataBind
```

### 3. **Kubernetes Configuration**
```
helm-charts/
├── ai-services/                      ← AI services deployment
│   ├── Chart.yaml
│   ├── values.yaml                  ← Configuration for all 7 AI services
│   └── templates/
├── banking-service/                  ← Generic banking service template
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
├── environments/
│   ├── dev/
│   │   ├── account-service.yaml
│   │   ├── api-gateway.yaml
│   │   └── ... (10 banking services)
│   ├── staging/
│   └── prod/
└── monitoring-stack/                ← Monitoring setup
```

### 4. **Spring Boot Configuration**
```
application.yml files for each service:
├── ai-core-module/src/main/resources/
├── ai-fraud-detection/src/main/resources/
├── ai-credit-service/src/main/resources/
├── account-service/src/main/resources/
├── api-gateway/src/main/resources/
└── ... (18 total)
```

---

## 🎯 AI Services Configuration

### 1. **AI Core Module** (Port 8080)
```yaml
# Purpose: Shared ML/DL infrastructure
# Framework: DeepLearning4j + ND4J
# Features:
#   - Neural network training
#   - Model persistence
#   - Feature engineering
#   - Data preprocessing

Resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"

Config:
  management.endpoints.web.exposure.include: "*"
  spring.jpa.hibernate.ddl-auto: update
```

### 2. **Fraud Detection Service** (Port 9001)
```yaml
# Purpose: Detect fraudulent transactions
# Framework: Machine Learning Classification
# Features:
#   - Real-time anomaly detection
#   - Pattern recognition
#   - Velocity analysis
#   - Machine learning models

Replica Count: 2 (High availability)

Resources:
  requests:
    memory: "768Mi"
    cpu: "500m"
  limits:
    memory: "1.5Gi"
    cpu: "1000m"

Config:
  ai.fraud.daily-limit: 100000.0
  ai.fraud.single-transaction-limit: 50000.0
  ai.fraud.max-transactions-per-hour: 10
  ai.fraud.velocity-threshold: 5000.0

Kafka Topics:
  - fraud.alerts
  - fraud.manual.review
  - fraud.transactions.analyzed
```

### 3. **Credit Service** (Port 8081-derivative)
```yaml
# Purpose: Credit scoring and risk assessment
# Framework: Neural Networks
# Features:
#   - Credit score calculation
#   - Risk assessment
#   - Approval prediction
#   - Profile analysis
```

### 4. **Recommendation Service**
```yaml
# Purpose: Product & service recommendations
# Framework: Collaborative Filtering
# Features:
#   - Customer preferences
#   - Historical behavior analysis
#   - Cross-sell/upsell recommendations
#   - Personalization
```

### 5. **Analytics Service**
```yaml
# Purpose: Data analytics & insights
# Framework: Predictive Analytics
# Features:
#   - Trend analysis
#   - Forecasting
#   - Customer segmentation
#   - Business intelligence
```

### 6. **Chatbot Service** (Port 8082-derivative)
```yaml
# Purpose: AI-powered customer support
# Framework: NLP/Deep Learning
# Features:
#   - Natural language processing
#   - Intent recognition
#   - Entity extraction
#   - Context understanding
```

### 7. **ML Pipeline** (Port 8086)
```yaml
# Purpose: AutoML & model training pipeline
# Framework: DeepLearning4j + ND4J
# Features:
#   - Automated model training
#   - Hyperparameter tuning
#   - Model evaluation
#   - Pipeline orchestration
```

---

## 🔌 Banking Services Configuration

### Service Endpoints

| Service | Port | Purpose |
|---------|------|---------|
| discovery-server | 8761 | Service registry (Eureka) |
| api-gateway | 8080 | Request routing |
| auth-service | 8089 | Authentication & JWT |
| account-service | 8081 | Account management |
| customer-service | 8082 | Customer data |
| transaction-service | 8083 | Transaction processing |
| notification-service | 8084 | Notifications |
| payment-service | 8085 | Payment processing |
| employee-service | 8086 | Employee data |
| common-service | 8087 | Shared utilities |

### Database Configuration

```yaml
account-service:
  db: MySQL
  host: mysql-account.db.svc.cluster.local
  name: account_db

customer-service:
  db: PostgreSQL
  host: postgres-customer.db.svc.cluster.local
  name: customer_db

auth-service:
  db: PostgreSQL
  host: postgres-auth.db.svc.cluster.local
  name: auth_db

transaction-service:
  db: MySQL
  host: mysql-transaction.db.svc.cluster.local
  name: transaction_db

payment-service:
  db: MySQL
  host: mysql-payment.db.svc.cluster.local
  name: payment_db
```

---

## 📦 Deployment Configuration

### Helm Values Structure

**File:** `helm-charts/ai-services/values.yaml`

```yaml
global:
  environment: dev  # dev, staging, prod
  logLevel: INFO

# Service-specific configs:
aiCoreModule:
  enabled: true
  replicaCount: 1
  resources: {...}
  config: {...}

fraudDetection:
  enabled: true
  replicaCount: 2
  resources: {...}
  config: {...}

creditService:
  enabled: false
  replicaCount: 1
  resources: {...}

# ... other services
```

### Environment-Specific Values

**dev:** `/helm-charts/environments/dev/`
```yaml
appConfig:
  DB_HOST: "mysql-account.db.svc.cluster.local"
  DB_NAME: "account_db"
  DB_USERNAME: "root"
  DB_PASSWORD: "root"
  
service:
  port: 8081
  
ingress:
  enabled: true
  host: "qactsai.local"
```

---

## 🚀 Building & Deployment

### Option 1: Jenkins UI (Recommended)
```
1. Jenkins Home → banking-services-ai
2. Build with Parameters:
   - BUILD_AI_MODULES: ✓
   - BUILD_AI_SERVICES: ✓
   - DEPLOY_AI_SERVICES: ✓
   - SKIP_TESTS: ✓
   - BUILD_IMAGES: ✓
   - DEPLOY_ENVIRONMENT: dev
3. Click "Build"
```

### Option 2: Command Line
```bash
# Full build with deployment
./mvnw clean package -DskipTests -T 1C

# Deploy to Kubernetes
helm install ai-services helm-charts/ai-services \
  -f helm-charts/environments/dev/ai-services.yaml \
  -n backend \
  --create-namespace
```

### Option 3: Setup Script
```bash
chmod +x setup-jenkins-ai.sh
./setup-jenkins-ai.sh
```

---

## 🔍 Monitoring & Verification

### Health Check
```bash
# Check all AI services
curl http://localhost:8080/actuator/health
curl http://localhost:9001/actuator/health

# Service discovery
curl http://localhost:8761/eureka/apps
```

### Kubernetes Verification
```bash
# Check deployments
kubectl get deployments -n backend

# Check pods
kubectl get pods -n backend | grep ai-

# Check services
kubectl get svc -n backend | grep ai-

# View logs
kubectl logs -n backend -l app=ai-fraud-detection
```

### Metrics & Monitoring
```
Prometheus: http://localhost:9090
Grafana:    http://localhost:3000
Jaeger:     http://localhost:16686
```

---

## 📝 Configuration Properties

### Spring Boot Properties (All Services)

```yaml
server:
  port: ${PORT}

spring:
  application:
    name: ${SERVICE_NAME}
  
  datasource:
    url: jdbc:mysql://${DB_HOST}:3306/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  
  kafka:
    bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: ${SERVICE_NAME}-group
      auto-offset-reset: earliest

eureka:
  client:
    service-url:
      defaultZone: http://${EUREKA_SERVER_URL:localhost:8761}/eureka/

management:
  endpoints:
    web:
      exposure:
        include: "*"
  endpoint:
    health:
      show-details: always
  tracing:
    sampling:
      probability: 1.0
  otlp:
    tracing:
      endpoint: http://jaeger.monitoring.svc.cluster.local:4318/v1/traces
```

### Environment Variables

**Essential:**
```
EUREKA_SERVER_URL        → Discovery server (default: localhost:8761)
DB_HOST                  → Database hostname
DB_NAME                  → Database name
DB_USERNAME              → Database user
DB_PASSWORD              → Database password
KAFKA_BOOTSTRAP_SERVERS  → Kafka brokers (default: localhost:9092)
```

**Optional:**
```
LOG_LEVEL                → Application log level (default: INFO)
JAEGER_OTLP_ENDPOINT    → Tracing endpoint
OTEL_SAMPLING_PROBABILITY → Trace sampling (default: 1.0)
```

---

## 🔐 Security Configuration

### JWT/OAuth (Auth Service)
```yaml
security:
  jwt:
    secret: ${JWT_SECRET:your-secret-key}
    expiration: ${JWT_EXPIRATION:86400}
```

### Database Credentials
```yaml
# Use Kubernetes secrets in production:
kubectl create secret generic db-credentials \
  --from-literal=username=root \
  --from-literal=password=root \
  -n backend
```

### CORS Configuration (API Gateway)
```yaml
# Configured in api-gateway/application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: account-service
          uri: http://account-service:8081
          predicates:
            - Path=/accounts/**
```

---

## 📊 Resource Allocation

### AI Services
```yaml
aiCoreModule:
  requests:   {memory: 512Mi,  cpu: 250m}
  limits:     {memory: 1Gi,    cpu: 500m}

fraudDetection:
  requests:   {memory: 768Mi,  cpu: 500m}
  limits:     {memory: 1.5Gi,  cpu: 1Gi}

otherAIServices:
  requests:   {memory: 512Mi,  cpu: 250m}
  limits:     {memory: 1Gi,    cpu: 500m}
```

### Banking Services
```yaml
apiGateway:
  requests:   {memory: 256Mi,  cpu: 100m}
  limits:     {memory: 512Mi,  cpu: 250m}

discoveryServer:
  requests:   {memory: 512Mi,  cpu: 200m}
  limits:     {memory: 1Gi,    cpu: 500m}

otherServices:
  requests:   {memory: 256Mi,  cpu: 100m}
  limits:     {memory: 512Mi,  cpu: 250m}
```

---

## ✅ Configuration Checklist

### Pre-Deployment
- [x] All 18 modules in pom.xml
- [x] Maven dependencies resolved
- [x] Docker images configured
- [x] Helm charts created
- [x] Environment values set

### Deployment
- [ ] Kubernetes cluster running
- [ ] Helm repos updated
- [ ] Namespaces created (`kubectl create namespace backend`)
- [ ] ConfigMaps created (`kubectl apply -f helm-charts/global-config.yaml`)
- [ ] Persistent volumes available
- [ ] Database services deployed

### Post-Deployment
- [ ] All pods in Running state
- [ ] Services registered with Eureka
- [ ] Health checks passing
- [ ] Metrics flowing to Prometheus
- [ ] Logs aggregated in ELK/Loki
- [ ] Tracing visible in Jaeger

---

## 🆘 Troubleshooting

### Build Issues
```bash
# Clean build
./mvnw clean package -DskipTests

# Check dependencies
./mvnw dependency:resolve

# View tree
./mvnw dependency:tree
```

### Deployment Issues
```bash
# Check pod logs
kubectl logs POD_NAME -n backend

# Describe pod
kubectl describe pod POD_NAME -n backend

# Check events
kubectl get events -n backend --sort-by='.lastTimestamp'
```

### Connectivity Issues
```bash
# Test service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  sh -c "curl http://ai-fraud-detection:9001/actuator/health"

# Port forward
kubectl port-forward svc/ai-fraud-detection 9001:9001 -n backend
```

---

## 📚 Related Documentation

- **JENKINS_AI_QUICK_START.md** - Quick start guide
- **JENKINS_AI_DEPLOYMENT_GUIDE.md** - Detailed deployment
- **MAVEN_DEPENDENCIES_FIXED.md** - Dependency details
- **HOW_TO_TEST_AI_SERVICES.md** - Testing guide
- **SERVICE_DISCOVERY_GUIDE.md** - Service discovery

---

## 🎓 Key Concepts

### Service Discovery
All services register with Eureka Discovery Server (port 8761)
```
discovery-server → Eureka registry
all services → Auto-register on startup
api-gateway → Discovers services dynamically
```

### Inter-Service Communication
Services communicate via service names (Kubernetes DNS):
```
http://service-name:port/path
http://ai-fraud-detection:9001/api/detect
http://account-service:8081/api/accounts
```

### Data Flow
```
API Gateway (8080)
    ↓
Auth Service (8089)
    ↓
Business Service (8081-8087)
    ↓
AI Services (8080, 9001, etc.) + Databases
    ↓
Kafka Topics (Event streaming)
    ↓
Notification Service (8084)
```

### Monitoring Flow
```
Services (Micrometer metrics)
    ↓
Prometheus (port 9090)
    ↓
Grafana (port 3000)

Jaeger (port 16686) ← Distributed tracing
    ↓
Services (OpenTelemetry instrumentation)
```

---

## 🚀 Next Steps

1. **Review Configuration**: Read through values.yaml files
2. **Prepare Environment**: Ensure Kubernetes, Helm, Docker ready
3. **Build & Test**: Run Jenkins pipeline
4. **Monitor**: Check Prometheus, Grafana, Jaeger
5. **Scale**: Adjust replicas and resources as needed

---

**Status: ✅ Configuration Complete & Ready for Deployment**

All banking-services-ai configurations are in place. Your system is ready to:
- ✅ Build all 18 microservices
- ✅ Deploy to Kubernetes
- ✅ Run AI/ML models
- ✅ Monitor performance
- ✅ Scale on demand



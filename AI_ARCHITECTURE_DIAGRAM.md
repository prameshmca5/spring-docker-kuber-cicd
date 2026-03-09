# AI Architecture & Module Placement

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API Gateway (Port 8080)                            │
│                    (Route AI requests to appropriate services)              │
└────────────────────────┬──────────────────────────────────────┬─────────────┘
                         │                                      │
        ┌────────────────┴───────────────┐          ┌──────────┴────────────┐
        │                                │          │                       │
   ┌────▼─────────────┐    ┌────────────▼──────┐  ┌▼────────────────┐   ┌──▼──────────────┐
   │  Transactions    │    │  Accounts         │  │  Payments      │   │  Employees      │
   │  Service         │    │  Service          │  │  Service       │   │  Service        │
   │ (Port 8083)      │    │ (Port 8081)       │  │ (Port 8085)    │   │ (Port 8086)     │
   │                  │    │                   │  │                │   │                 │
   │ ┌──────────────┐ │    │ ┌──────────────┐ │  │ ┌────────────┐ │   │ ┌────────────┐ │
   │ │ Controllers  │ │    │ │ Controllers  │ │  │ │ Controllers│ │   │ │ Controllers│ │
   │ ├──────────────┤ │    │ ├──────────────┤ │  │ ├────────────┤ │   │ ├────────────┤ │
   │ │ Services     │ │    │ │ Services     │ │  │ │ Services   │ │   │ │ Services   │ │
   │ ├──────────────┤ │    │ ├──────────────┤ │  │ ├────────────┤ │   │ ├────────────┤ │
   │ │ Repositories │ │    │ │ Repositories │ │  │ │ Repositories   │   │ │ Repositories   │
   │ └──────────────┘ │    │ └──────────────┘ │  │ └────────────┘ │   │ └────────────┘ │
   └────────────────────┘    └─────────────────┘  └───────────────┘   └─────────────────┘
        │                            │                    │                    │
        └────────────────┬───────────┴────────────────────┴────────────────────┘
                         │
                    ┌────▼─────────────────────────────────┐
                    │     Kafka Event Bus (Bootstrap: 9092)│
                    │                                      │
                    │  Topics:                             │
                    │  • transaction.created               │
                    │  • account.created                   │
                    │  • payment.processed                 │
                    │  • fraud.alerts                      │
                    │  • credit.assessments                │
                    │  • recommendations.generated         │
                    │  • churn.predictions                 │
                    └────────────────┬──────────────────────┘
                                     │
        ┌────────────────────────────┼──────────────────────────────┐
        │                            │                              │
   ┌────▼─────────────────┐  ┌──────▼──────────────┐  ┌───────────▼────────┐
   │  NOTIFICATION        │  │  FEATURE STORE      │  │  ML PIPELINE       │
   │  SERVICE             │  │  (Redis)            │  │  MANAGER           │
   │                      │  │                     │  │                    │
   │  • Email Alerts      │  │  Cached Features:   │  │  • Data ETL        │
   │  • SMS Alerts        │  │  • Customer Profile │  │  • Feature Eng     │
   │  • Push Notifs       │  │  • Transaction Hist │  │  • Model Training  │
   │  • In-App Messages   │  │  • Risk Scores      │  │  • Model Eval      │
   └──────────────────────┘  └─────────────────────┘  └────────────────────┘
        │                            │                          │
        └────────────────┬───────────┴──────────────────────────┘
                         │
                    ┌────▼────────────────────────────────────────────────┐
                    │          AI SERVICES (NEW MODULES)                  │
                    │                                                     │
        ┌───────────┴──────────────┐                                      │
        │                          │                                      │
   ┌────▼──────────────────┐  ┌────▼──────────────────┐                 │
   │ AI FRAUD DETECTION    │  │ AI CREDIT SERVICE     │                 │
   │ (Port 9001)           │  │ (Port 9002)           │                 │
   │                       │  │                       │                 │
   │ ┌─────────────────┐   │  │ ┌─────────────────┐   │                 │
   │ │Rule Engine      │   │  │ │Credit Scorer    │   │                 │
   │ ├─────────────────┤   │  │ ├─────────────────┤   │                 │
   │ │ML Anomaly       │   │  │ │Loan Eligibility │   │                 │
   │ │Detector         │   │  │ ├─────────────────┤   │                 │
   │ ├─────────────────┤   │  │ │Risk Assessment  │   │                 │
   │ │Device Finger    │   │  │ └─────────────────┘   │                 │
   │ │printing         │   │  │                       │                 │
   │ └─────────────────┘   │  │                       │                 │
   └───────────────────────┘  └───────────────────────┘                 │
        │                            │                                  │
        ├────────────────┬───────────┴──────────────┐                  │
        │                │                         │                  │
   ┌────▼───────────┐  ┌─▼──────────────────┐  ┌──▼────────────────┐  │
   │ AI RECOMMENDATION  │ AI ANALYTICS      │  │ AI CHATBOT        │  │
   │ SERVICE            │ SERVICE           │  │ SERVICE           │  │
   │ (Port 9003)        │ (Port 9004)       │  │ (Port 9005)       │  │
   │                    │                   │  │                   │  │
   │ • Collaborative    │ • Churn Pred      │  │ • Intent Class    │  │
   │   Filtering        │ • Default Risk    │  │ • Entity Extract  │  │
   │ • Content-based    │ • CLV Forecast    │  │ • FAQ Matching    │  │
   │   Matching         │                   │  │                   │  │
   │ • Segmentation     │                   │  │                   │  │
   └────────────────────┘  └───────────────┘  └───────────────────┘  │
        │                            │                │              │
        └────────────────┬───────────┴────────────────┴──────────────┘
                         │
                    ┌────▼──────────────────────────────┐
                    │   AI CORE MODULE (Foundation)     │
                    │   (Port 9000)                     │
                    │                                  │
                    │  ┌──────────────────────────┐    │
                    │  │ Model Registry           │    │
                    │  │ (DB: PostgreSQL)         │    │
                    │  ├──────────────────────────┤    │
                    │  │ Model Loader             │    │
                    │  ├──────────────────────────┤    │
                    │  │ Feature Store Conn       │    │
                    │  ├──────────────────────────┤    │
                    │  │ ML Utilities             │    │
                    │  └──────────────────────────┘    │
                    └────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┬──────────────────┐
        │                                 │                  │
   ┌────▼────────────────┐  ┌────────────▼────┐  ┌──────────▼─────┐
   │ PostgreSQL          │  │  Redis Cache    │  │  Prometheus    │
   │ (Model Registry)    │  │  (Features)     │  │  (Monitoring)  │
   └──────────────────────┘  └─────────────────┘  └────────────────┘
```

---

## Module Placement in Project Structure

```
spring-docker-kuber-cicd/
│
├── pom.xml (UPDATED: Add AI modules)
│
├── ai-core-module/                    ◄── FOUNDATION
│   ├── pom.xml
│   ├── src/main/java/com/qacts/aicore/
│   │   ├── model/
│   │   │   └── ModelMetadata.java
│   │   ├── registry/
│   │   │   └── ModelRegistry.java
│   │   ├── service/
│   │   │   └── ModelLoaderService.java
│   │   └── config/
│   │       └── AICoreConfig.java
│   └── src/test/java/...
│
├── ai-fraud-detection/                ◄── PRIORITY 1
│   ├── pom.xml
│   ├── src/main/java/com/qacts/aifraud/
│   │   ├── model/
│   │   │   └── FraudScore.java
│   │   ├── service/
│   │   │   ├── RuleBasedFraudDetector.java
│   │   │   ├── MLFraudDetector.java
│   │   │   └── FraudDetectionService.java
│   │   ├── controller/
│   │   │   └── FraudDetectionController.java
│   │   ├── kafka/
│   │   │   └── FraudAlertProducer.java
│   │   └── config/
│   │       └── FraudDetectionConfig.java
│   └── src/test/java/...
│
├── ai-credit-service/                 ◄── PRIORITY 2
│   ├── pom.xml
│   ├── src/main/java/com/qacts/aicredit/
│   │   ├── model/
│   │   ├── service/
│   │   │   ├── CreditScorer.java
│   │   │   ├── LoanEligibilityEngine.java
│   │   │   └── RiskAssessment.java
│   │   ├── controller/
│   │   │   └── CreditController.java
│   │   └── config/
│   └── src/test/java/...
│
├── ai-recommendation-service/         ◄── PRIORITY 3
│   ├── pom.xml
│   ├── src/main/java/com/qacts/airecommend/
│   │   ├── service/
│   │   │   ├── RecommendationEngine.java
│   │   │   ├── CustomerSegmenter.java
│   │   │   └── CollaborativeFiltering.java
│   │   ├── controller/
│   │   └── config/
│   └── src/test/java/...
│
├── ai-analytics-service/              ◄── PRIORITY 4
│   ├── pom.xml
│   ├── src/main/java/com/qacts/aianalytics/
│   │   ├── service/
│   │   │   ├── ChurnPredictor.java
│   │   │   ├── DefaultRiskPredictor.java
│   │   │   └── CLVPredictor.java
│   │   ├── controller/
│   │   └── config/
│   └── src/test/java/...
│
├── ai-chatbot-service/                ◄── PRIORITY 5
│   ├── pom.xml
│   ├── src/main/java/com/qacts/aichatbot/
│   │   ├── service/
│   │   │   ├── ChatbotService.java
│   │   │   ├── IntentClassifier.java
│   │   │   └── FAQMatcher.java
│   │   ├── controller/
│   │   └── config/
│   └── src/test/java/...
│
├── ai-ml-pipeline/                    ◄── INFRASTRUCTURE
│   ├── pom.xml
│   ├── src/main/java/com/qacts/aiml/
│   │   ├── model/
│   │   │   ├── ModelTrainer.java
│   │   │   └── ModelEvaluator.java
│   │   ├── feature/
│   │   │   └── FeatureExtractor.java
│   │   ├── experiment/
│   │   │   └── ExperimentTracker.java
│   │   └── config/
│   └── src/test/java/...
│
│
├── account-service/                   ◄── MODIFIED
│   ├── pom.xml (add ai-core-module dependency)
│   ├── src/main/java/com/qacts/accountservice/
│   │   ├── controller/
│   │   │   └── AccountController.java (modified for AI integration)
│   │   └── ...
│   └── ...
│
├── transaction-service/               ◄── MODIFIED
│   ├── pom.xml (add ai-fraud-detection dependency)
│   ├── src/main/java/com/qacts/transactionservice/
│   │   ├── controller/
│   │   │   └── TransactionController.java (modified)
│   │   ├── service/
│   │   │   └── TransactionService.java (modified)
│   │   └── ...
│   └── ...
│
├── payment-service/                   ◄── MODIFIED
│   ├── pom.xml (add ai-credit-service dependency)
│   ├── src/main/java/com/qacts/paymentservice/
│   │   ├── controller/
│   │   │   └── PaymentController.java (modified)
│   │   └── ...
│   └── ...
│
├── notification-service/              ◄── MODIFIED
│   ├── pom.xml (add Kafka listeners)
│   ├── src/main/java/com/qacts/notificationservice/
│   │   ├── listener/
│   │   │   ├── FraudAlertListener.java (NEW)
│   │   │   ├── ChurnAlertListener.java (NEW)
│   │   │   └── RecommendationListener.java (NEW)
│   │   └── ...
│   └── ...
│
├── api-gateway/                       ◄── MODIFIED
│   ├── src/main/resources/application.yml (add AI routes)
│   └── ...
│
├── helm-charts/                       ◄── MODIFIED
│   ├── banking-service/templates/
│   │   ├── deployment.yaml (update for new AI services)
│   │   └── service.yaml
│   ├── ai-services/                 (NEW)
│   │   ├── values.yaml
│   │   ├── Chart.yaml
│   │   └── templates/
│   │       ├── fraud-detection-deployment.yaml
│   │       ├── credit-service-deployment.yaml
│   │       ├── recommendation-deployment.yaml
│   │       ├── analytics-deployment.yaml
│   │       └── chatbot-deployment.yaml
│   └── monitoring/
│       └── prometheus-rules.yaml (add AI metrics)
│
├── docker-compose.yml                 ◄── MODIFIED
│   (Add AI services)
│
└── README.md                          ◄── UPDATED
    (Document AI implementation)
```

---

## Integration Timeline

### Phase 1: Foundation (Week 1)
```
✓ Create ai-core-module
✓ Set up ModelMetadata entity
✓ Create ModelLoaderService
✓ Configure PostgreSQL for model registry
```

### Phase 2: Fraud Detection (Week 2-3)
```
→ Implement ai-fraud-detection module
→ Create rule-based fraud detector
→ Add Kafka integration
→ Create fraud alert topics
```

### Phase 3: Service Integration (Week 4)
```
→ Update transaction-service to use fraud detection
→ Update account-service for recommendations
→ Update payment-service for credit assessment
→ Update notification-service for alerts
```

### Phase 4: Advanced Services (Week 5-8)
```
→ Implement ai-credit-service
→ Implement ai-recommendation-service
→ Implement ai-analytics-service
→ Implement ai-chatbot-service
```

### Phase 5: ML Pipeline & Monitoring (Week 9-10)
```
→ Create ai-ml-pipeline module
→ Set up model training infrastructure
→ Configure Prometheus metrics
→ Create monitoring dashboards
```

---

## Data Flow Examples

### Example 1: Fraud Detection Flow

```
Customer initiates transaction
        ↓
TransactionController.createTransaction()
        ↓
Call AI Fraud Detection Service
        ↓
RuleBasedFraudDetector.detectFraud()
        ↓
Calculate Risk Factors:
  - Amount anomaly: 0.45
  - Velocity: 0.35
  - Geographic: 0.20
  - Device: 0.25
  - Time: 0.10
        ↓
Combined Score: 0.76 (HIGH RISK)
        ↓
Publish to Kafka: fraud.alerts topic
        ↓
NotificationService listens and sends:
  - Email alert to customer
  - SMS alert
  - In-app notification
        ↓
Transaction status: BLOCKED / REVIEW_PENDING
```

### Example 2: Recommendation Flow

```
Customer views account dashboard
        ↓
RecommendationController.getRecommendations(customerId)
        ↓
RecommendationEngine analyzes:
  - Customer segment
  - Account balance
  - Transaction history
  - Product affinity
        ↓
Generate recommendations:
  - "Upgrade to Premium account"
  - "Consider savings account"
  - "Eligible for credit card"
        ↓
Return to frontend
        ↓
Display personalized recommendations
```

---

## Deployment Architecture

### Kubernetes Namespace: `backend`

```
backend namespace:
├── discovery-server pod
├── api-gateway pod
├── account-service pod (1-3 replicas)
├── transaction-service pod (1-3 replicas)
├── payment-service pod (1-3 replicas)
├── notification-service pod (1-2 replicas)
├── employee-service pod (1 replica)
├── auth-service pod (1 replica)
├── common-service pod (1 replica)
├── customer-service pod (1-2 replicas)
│
├── AI SERVICES (NEW):
├── ai-core-module pod (1 replica)
├── ai-fraud-detection pod (2-3 replicas)
├── ai-credit-service pod (2-3 replicas)
├── ai-recommendation-service pod (2 replicas)
├── ai-analytics-service pod (1-2 replicas)
└── ai-chatbot-service pod (2-3 replicas)

db namespace:
├── MySQL pod
├── PostgreSQL pod
└── Model Registry DB (PostgreSQL)

external-tools namespace:
├── Kafka pod (3 brokers)
├── Redis pod (for feature store)
├── Elasticsearch pod (logging)
└── Jaeger pod (tracing)

monitoring namespace:
├── Prometheus pod
├── Grafana pod
└── ELK Stack pods
```

---

## Success Criteria

✓ All AI modules build successfully
✓ Fraud detection accurately flags 95%+ fraudulent transactions
✓ Credit scoring has 90%+ accuracy
✓ Recommendations increase conversion by 20%+
✓ Churn prediction identifies 85%+ at-risk customers
✓ System latency <200ms for fraud check (p95)
✓ All AI services are monitored
✓ Documentation is complete



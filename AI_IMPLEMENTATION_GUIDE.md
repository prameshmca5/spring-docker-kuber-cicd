# AI Module Implementation Guide

## Quick Start

Your banking microservices project now has AI infrastructure ready to be implemented. This guide shows you how to use it.

---

## 1. AI Core Module (Foundation)

**Location:** `ai-core-module/`

**Purpose:** Provides shared AI infrastructure for all AI services

**Key Components:**

### ModelMetadata Entity
Tracks all trained ML models:
```java
ModelMetadata model = ModelMetadata.builder()
    .modelName("fraud-detector-v1")
    .modelVersion("1.0.0")
    .modelType(ModelMetadata.ModelType.FRAUD_DETECTION)
    .accuracy(0.96)
    .precision(0.94)
    .recall(0.92)
    .status(ModelMetadata.ModelStatus.ACTIVE)
    .createdBy("data-team")
    .build();
```

### ModelLoaderService
Load and manage models:
```java
Optional<Object> model = modelLoaderService.loadActiveModel("fraud-detector");
modelLoaderService.activateModel(modelId); // Switch to new version
modelLoaderService.recordPrediction(modelId, isCorrect); // Track accuracy
```

---

## 2. Fraud Detection Service

**Location:** `ai-fraud-detection/`

**Use Case:** Detect fraudulent transactions in real-time

### Features:
- Transaction amount anomalies
- Velocity checks (multiple transactions)
- Merchant risk assessment
- Geographic anomalies
- Time-based pattern analysis
- Device fingerprinting

### Example Usage in Transaction Service:

```java
// In transaction-service/src/main/java/.../TransactionController.java

@PostMapping("/api/v1/transactions")
public ResponseEntity<?> createTransaction(
        @RequestBody TransactionRequest request,
        @RequestHeader("X-User-Id") Long userId) {
    
    // Call fraud detection
    FraudScore fraudScore = fraudDetectionClient.analyzeFraud(
        request.getAccountId(),
        request.getAmount(),
        request.getDescription()
    );
    
    // Check risk level
    if (fraudScore.getRiskLevel() == FraudScore.FraudRiskLevel.CRITICAL) {
        log.warn("Transaction blocked due to fraud risk: {}", fraudScore.getReason());
        return ResponseEntity
            .status(403)
            .body(new ErrorResponse("Transaction blocked: " + fraudScore.getReason()));
    }
    
    if (fraudScore.getRiskLevel() == FraudScore.FraudRiskLevel.HIGH) {
        // Require additional verification
        return ResponseEntity
            .status(202) // Accepted - pending review
            .body(new PendingApprovalResponse(fraudScore));
    }
    
    // Proceed with transaction
    Transaction txn = transactionService.createTransaction(request);
    
    // Send fraud alert via Kafka if needed
    if (fraudScore.getFraudScore() > 0.3) {
        fraudAlertProducer.sendAlert(new FraudAlert(
            userId,
            fraudScore.getFraudScore(),
            fraudScore.getReason()
        ));
    }
    
    return ResponseEntity.ok(txn);
}
```

### Kafka Integration:

**Fraud Detection Topics:**
- `fraud.transactions.analyzed` - Published when fraud analysis completes
- `fraud.alerts` - High-risk fraud alerts
- `fraud.manual.review` - Transactions requiring manual review

**Example Kafka Listener in Notification Service:**

```java
@KafkaListener(topics = "fraud.alerts")
public void onFraudAlert(FraudAlert alert) {
    log.warn("Fraud alert received: {}", alert);
    
    Notification notification = Notification.builder()
        .customerId(alert.getCustomerId())
        .type(NotificationType.FRAUD_ALERT)
        .message("Suspicious activity detected on your account: " + alert.getReason())
        .channel(NotificationChannel.EMAIL)
        .channel(NotificationChannel.SMS)
        .build();
    
    notificationService.sendNotification(notification);
}
```

---

## 3. Credit Risk Service (Coming Soon)

**Location:** `ai-credit-service/`

**Use Case:** Automated credit assessment and loan approval

### Implementation Steps:

```
Week 1: Credit scoring algorithm
Week 2: Loan eligibility rules
Week 3: Integration with account-service
Week 4: API endpoints and testing
```

### Example Future Usage:

```java
@PostMapping("/api/v1/accounts/apply-for-account")
public ResponseEntity<?> applyForAccount(@RequestBody AccountApplication app) {
    
    // Get credit assessment
    CreditAssessment assessment = creditService.assessCredit(app);
    
    if (assessment.isEligible()) {
        Account account = accountService.createAccount(app, assessment.getCreditLimit());
        return ResponseEntity.ok(account);
    } else {
        return ResponseEntity.status(403).body(assessment.getDenialReason());
    }
}
```

---

## 4. Recommendation Engine (Coming Soon)

**Location:** `ai-recommendation-service/`

**Use Case:** Personalized product recommendations

### Features:
- Account upgrade suggestions
- Cross-sell recommendations
- Investment opportunities
- Savings product recommendations

---

## 5. Predictive Analytics (Coming Soon)

**Location:** `ai-analytics-service/`

**Use Case:** Customer behavior prediction

### Features:
- Churn prediction
- Default risk prediction
- Customer lifetime value
- Spending pattern forecasting

---

## Integration Checklist

### Step 1: Update Parent POM

Add AI modules to the parent `pom.xml`:

```xml
<modules>
    <!-- ...existing modules... -->
    <module>ai-core-module</module>
    <module>ai-fraud-detection</module>
    <module>ai-credit-service</module>
    <module>ai-recommendation-service</module>
    <module>ai-analytics-service</module>
</modules>
```

### Step 2: Add AI Dependencies to Services

**In transaction-service/pom.xml:**

```xml
<dependency>
    <groupId>com.qacts</groupId>
    <artifactId>ai-fraud-detection</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

**In account-service/pom.xml:**

```xml
<dependency>
    <groupId>com.qacts</groupId>
    <artifactId>ai-core-module</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

### Step 3: Configure Kafka Topics

Add to docker-compose.yml or Kafka configuration:

```yaml
topics:
  - name: fraud.transactions.analyzed
    partitions: 3
    replication_factor: 1
  - name: fraud.alerts
    partitions: 1
    replication_factor: 1
  - name: fraud.manual.review
    partitions: 1
    replication_factor: 1
  - name: credit.assessments
    partitions: 3
    replication_factor: 1
  - name: recommendations.generated
    partitions: 3
    replication_factor: 1
  - name: churn.predictions
    partitions: 1
    replication_factor: 1
```

### Step 4: Configure Application Properties

**In fraud-detection service `application.yml`:**

```yaml
spring:
  application:
    name: ai-fraud-detection
  kafka:
    bootstrap-servers: kafka:9092
    producer:
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

eureka:
  client:
    service-url:
      defaultZone: http://discovery-server.backend.svc.cluster.local:8761/eureka/
  instance:
    prefer-ip-address: true

ai:
  fraud:
    daily-limit: 100000.0
    single-transaction-limit: 50000.0
    max-transactions-per-hour: 10
    velocity-threshold: 5000.0
    enable-ml-model: true
    model-name: fraud-detector-v1
```

### Step 5: Database Migration

Create database tables for model registry:

```sql
CREATE TABLE model_registry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_version VARCHAR(50) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    description TEXT,
    model_path VARCHAR(255) NOT NULL,
    model_format VARCHAR(50) NOT NULL,
    accuracy DOUBLE NOT NULL,
    precision DOUBLE NOT NULL,
    recall DOUBLE NOT NULL,
    f1_score DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    deployed_at TIMESTAMP,
    deprecated_at TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    total_predictions INT DEFAULT 0,
    correct_predictions INT DEFAULT 0,
    last_prediction_time TIMESTAMP
);
```

### Step 6: Update API Gateway Routes

In `api-gateway/src/main/resources/application.yml`:

```yaml
spring:
  cloud:
    gateway:
      routes:
        # ...existing routes...
        - id: fraud-detection
          uri: lb://ai-fraud-detection
          predicates:
            - Path=/api/v1/fraud-detection/**
          filters:
            - AuthenticationFilter
        - id: credit-service
          uri: lb://ai-credit-service
          predicates:
            - Path=/api/v1/credit/**
          filters:
            - AuthenticationFilter
        - id: recommendations
          uri: lb://ai-recommendation-service
          predicates:
            - Path=/api/v1/recommendations/**
          filters:
            - AuthenticationFilter
```

---

## Testing the AI Modules

### Unit Tests

Create test for fraud detection:

```java
// ai-fraud-detection/src/test/java/.../FraudDetectionServiceTest.java

@SpringBootTest
class FraudDetectionServiceTest {
    
    @Autowired
    private RuleBasedFraudDetector fraudDetector;
    
    @Test
    void testHighAmountFlagsAsHighRisk() {
        TransactionData txn = createTransaction(60000.0); // Over limit
        CustomerProfile customer = createCustomerProfile();
        
        FraudScore score = fraudDetector.detectFraud(txn, customer);
        
        assertEquals(FraudScore.FraudRiskLevel.HIGH, score.getRiskLevel());
        assertEquals("REVIEW_PENDING", score.getApprovalStatus());
    }
    
    @Test
    void testHighVelocityFlagsAsAnomaly() {
        // Test rapid transaction velocity
    }
    
    @Test
    void testNewDeviceFlagsAsAnomaly() {
        // Test unknown device detection
    }
}
```

### Integration Tests

```java
// Test Kafka integration
@SpringBootTest
@EmbeddedKafka
class FraudDetectionIntegrationTest {
    
    @Test
    void testFraudAlertPublishedOnHighRiskTransaction() {
        // Verify Kafka message is published
    }
}
```

---

## Monitoring & Observability

### Prometheus Metrics

Track AI service metrics:

```yaml
# Metrics endpoint: /actuator/prometheus

ai_fraud_detection_scores:
  - model_name: fraud-detector-v1
    risk_level: high
    count: 42

ai_model_accuracy:
  - model_name: fraud-detector-v1
    current_accuracy: 0.96

ai_prediction_latency:
  - service: fraud-detection
    p99: 125ms
    p95: 85ms
```

### Logging

All AI predictions are logged:

```
2026-03-09 10:15:42.123 [fraud-detection,txn123,span456] WARN FraudDetector - 
    Fraud analysis completed for transaction 456789: score=0.78, level=HIGH, 
    reason=transaction_amount(0.45),velocity_check(0.35), action=REVIEW_PENDING
```

---

## Model Training & Updating

### Model Lifecycle

1. **Training** - Train new models on historical data
2. **Validation** - Test on held-out dataset
3. **Registration** - Register in model registry
4. **Activation** - Switch to new model version
5. **Monitoring** - Track accuracy on live data
6. **Deprecation** - Retire old models

### Adding New Model Version

```java
// Register trained model
ModelMetadata newModel = modelLoaderService.registerModel(
    "fraud-detector",
    "1.1.0",
    ModelMetadata.ModelType.FRAUD_DETECTION,
    "/models/fraud-detector-v1.1.onnx",
    "ONNX",
    0.97, // accuracy
    0.96, // precision
    0.94, // recall
    0.95, // f1-score
    "data-team"
);

// Activate new version (deactivates old one)
modelLoaderService.activateModel(newModel.getId());
```

---

## Next Steps

1. **Build & Test** - Run `mvn clean package` to build AI modules
2. **Deploy** - Push to Kubernetes with updated Helm charts
3. **Monitor** - Check metrics in Prometheus dashboard
4. **Iterate** - Improve models based on real-world performance
5. **Expand** - Add credit service, recommendations, etc.

---

## Production Checklist

- [ ] AI modules added to pom.xml
- [ ] Kafka topics created
- [ ] Model registry database configured
- [ ] Application properties updated
- [ ] API Gateway routes configured
- [ ] Helm charts updated for K8s deployment
- [ ] Monitoring dashboards created
- [ ] Alerting rules configured
- [ ] Documentation updated
- [ ] Team trained on AI services

---

## Support

For issues or questions about the AI implementation, refer to:
- AI_IMPLEMENTATION_STRATEGY.md (overview)
- Individual service README files
- Code comments and Javadoc



# AI Implementation - Quick Reference Card

## 📋 What's Been Created

| Module | Purpose | Status | Location |
|--------|---------|--------|----------|
| **ai-core-module** | Foundation for all AI services | ✅ Ready | `ai-core-module/` |
| **ai-fraud-detection** | Real-time fraud detection | ✅ Core logic done | `ai-fraud-detection/` |
| **ai-credit-service** | Credit assessment & scoring | 📋 Placeholder | `ai-credit-service/` |
| **ai-recommendation-service** | Product recommendations | 📋 Planned | `ai-recommendation-service/` |
| **ai-analytics-service** | Predictive analytics | 📋 Planned | `ai-analytics-service/` |
| **ai-chatbot-service** | Intelligent chatbot | 📋 Planned | `ai-chatbot-service/` |

---

## 🎯 Where to Add AI

### Transaction Service (Fraud Detection)
```java
@PostMapping("/api/v1/transactions")
public ResponseEntity<?> createTransaction(@RequestBody TransactionRequest req) {
    FraudScore fraud = fraudService.analyzeFraud(req);
    if (fraud.getRiskLevel() == HIGH) return status(403).build();
    return saveTransaction(req);
}
```
**File to modify:** `transaction-service/src/.../.../TransactionController.java`

### Account Service (Credit & Recommendations)
```java
@PostMapping("/api/v1/accounts")
public ResponseEntity<?> createAccount(@RequestBody AccountRequest req) {
    CreditScore score = creditService.assessCredit(req);
    List<Recommendation> recs = recommendationService.getRecommendations(req);
    if (score.isEligible()) return saveAccount(req);
    return status(403).build();
}
```
**File to modify:** `account-service/src/.../.../AccountController.java`

### Payment Service (Credit Assessment)
```java
@PostMapping("/api/v1/payments/loans")
public ResponseEntity<?> applyLoan(@RequestBody LoanRequest req) {
    double rate = creditService.calculateInterestRate(req);
    req.setInterestRate(rate);
    return saveLoan(req);
}
```
**File to modify:** `payment-service/src/.../.../PaymentController.java`

### Notification Service (Alerts)
```java
@KafkaListener(topics = "fraud.alerts")
public void onFraudAlert(FraudAlert alert) {
    sendEmail(alert.getCustomerId(), "Suspicious activity detected!");
    sendSMS(alert.getPhoneNumber(), "Transaction blocked");
}
```
**Files to add:**
- `notification-service/src/.../listener/FraudAlertListener.java`
- `notification-service/src/.../listener/ChurnAlertListener.java`

---

## 📊 Data Flow

```
User Action
    ↓
Microservice
    ↓
Call AI Service (Sync or Async)
    ↓
Get AI Prediction
    ↓
Take Action (approve/block/modify)
    ↓
Publish Event to Kafka
    ↓
Notification Service Listens & Alerts
```

---

## 🚀 Implementation Steps

### Week 1: Setup
- [ ] Build AI modules: `mvn clean package`
- [ ] Add to parent pom.xml
- [ ] Set up databases (PostgreSQL for model registry)
- [ ] Configure Kafka topics

### Week 2: Fraud Detection Integration
- [ ] Add ai-fraud-detection dependency to transaction-service
- [ ] Modify TransactionController to call fraud service
- [ ] Test with sample fraudulent transactions
- [ ] Deploy to Kubernetes

### Week 3: Kafka Integration
- [ ] Set up fraud alert topics
- [ ] Create FraudAlertListener in notification-service
- [ ] Test end-to-end alert flow

### Week 4+: Other Services
- [ ] Credit service → account-service
- [ ] Recommendations → account-service
- [ ] Analytics → customer-service

---

## 📝 Files to Modify

| Service | File | Action |
|---------|------|--------|
| transaction-service | pom.xml | Add ai-fraud-detection dependency |
| transaction-service | TransactionController.java | Call fraud detection |
| transaction-service | TransactionService.java | Handle fraud scores |
| account-service | pom.xml | Add ai-core-module, ai-credit-service |
| account-service | AccountController.java | Call credit assessment |
| payment-service | pom.xml | Add ai-credit-service |
| payment-service | PaymentController.java | Call credit service |
| notification-service | pom.xml | Add Kafka listeners |
| notification-service | (new) | FraudAlertListener.java |
| notification-service | (new) | ChurnAlertListener.java |
| api-gateway | application.yml | Add AI service routes |
| parent | pom.xml | Add AI modules |

---

## 🔌 Kafka Topics to Create

```bash
# Fraud Detection
kafka-topics --create --topic fraud.transactions.analyzed --partitions 3
kafka-topics --create --topic fraud.alerts --partitions 1
kafka-topics --create --topic fraud.manual.review --partitions 1

# Credit & Recommendations
kafka-topics --create --topic credit.assessments --partitions 3
kafka-topics --create --topic recommendations.generated --partitions 3

# Analytics
kafka-topics --create --topic churn.predictions --partitions 1
kafka-topics --create --topic default.risk.alerts --partitions 1
```

---

## 🔒 Risk Levels (Fraud Detection)

| Level | Score | Action |
|-------|-------|--------|
| LOW | 0.0-0.3 | Approve |
| MEDIUM | 0.3-0.7 | Require 2FA |
| HIGH | 0.7-0.85 | Manual Review |
| CRITICAL | 0.85-1.0 | Block |

---

## 📈 Key Metrics to Track

### Fraud Detection
- Detection Rate (Recall): 85%+
- Precision (False Positives): <5%
- Latency (p95): <200ms
- Blocked Transactions: Real-time

### Credit Assessment
- Approval Accuracy: 90%+
- False Approval Rate: <10%
- Default Prediction: 85%+ accuracy

### Recommendations
- Click-through Rate: 15%+
- Conversion Rate: 20%+
- Uptake Rate: 10%+

### Overall
- AI Service Uptime: 99.9%
- Integration Completion: 100%

---

## 🛠️ Useful Commands

```bash
# Build all modules
mvn clean package -DskipTests

# Build specific module
mvn clean package -pl ai-fraud-detection

# Run tests
mvn test -pl ai-core-module,ai-fraud-detection

# Check dependencies
mvn dependency:tree | grep ai-

# Deploy to Kubernetes
kubectl apply -f helm-charts/ai-services/
kubectl get pods -n backend | grep ai-

# View AI service logs
kubectl logs -f -l app=ai-fraud-detection -n backend

# Scale AI service
kubectl scale deployment ai-fraud-detection --replicas=3 -n backend

# Check Kafka topics
kafka-topics --list
kafka-topics --describe --topic fraud.alerts

# Monitor AI metrics
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Visit: http://localhost:9090
```

---

## 📚 Documentation

**Start here:**
1. `AI_IMPLEMENTATION_SUMMARY.md` ← READ FIRST
2. `AI_ARCHITECTURE_DIAGRAM.md` ← Visual guide
3. `AI_IMPLEMENTATION_GUIDE.md` ← Detailed steps
4. `AI_IMPLEMENTATION_STRATEGY.md` ← Comprehensive reference

---

## ✅ Pre-Integration Checklist

Before integrating with each service:

- [ ] Read AI_IMPLEMENTATION_GUIDE.md
- [ ] Understand fraud detection algorithm
- [ ] Review Kafka topics
- [ ] Understand data models (FraudScore, etc.)
- [ ] Set up test data
- [ ] Write unit tests
- [ ] Test fraud detection locally
- [ ] Deploy AI modules
- [ ] Configure Kafka
- [ ] Update service dependencies
- [ ] Modify controller/service code
- [ ] Test end-to-end flow
- [ ] Deploy to Kubernetes
- [ ] Monitor metrics
- [ ] Gather feedback

---

## 🎓 Example: Full Fraud Detection Flow

```
1. Customer initiates transaction
   POST /api/v1/transactions
   {
     "accountId": 123,
     "amount": 55000,
     "destination": "Unknown Merchant"
   }

2. TransactionController receives request
   ↓
3. Call fraud detection service:
   fraudService.analyzeFraud(transaction)
   ↓
4. Rule-based detector evaluates:
   • Amount score: 0.45 (over limit)
   • Velocity: 0.35 (5 txns in 1 hour)
   • Merchant: 0.20 (unknown)
   • Geographic: 0.10 (same country)
   • Device: 0.25 (new device)
   → Combined: 0.78 (HIGH RISK)
   ↓
5. Return FraudScore:
   {
     "fraudScore": 0.78,
     "riskLevel": "HIGH",
     "reason": "unusual_amount, high_velocity, unknown_merchant",
     "action": "MANUAL_REVIEW"
   }
   ↓
6. TransactionController checks risk level:
   if (score.getRiskLevel() == HIGH) {
       publish to Kafka: fraud.manual.review
       return 202 Accepted (pending review)
   }
   ↓
7. Kafka Consumer in fraud-management service:
   - Create manual review ticket
   - Notify compliance team
   ↓
8. Notification Service listens to fraud.alerts:
   - Send email: "Suspicious activity detected"
   - Send SMS: "Your transaction is pending review"
   - In-app notification with retry option
```

---

## 🔄 Testing Scenarios

### Test 1: Normal Transaction
```json
{
  "accountId": 1,
  "amount": 5000,
  "merchant": "Amazon",
  "location": "Home Country",
  "device": "Registered iPhone"
}
→ Expected: APPROVED (score < 0.3)
```

### Test 2: Suspicious Amount
```json
{
  "accountId": 1,
  "amount": 60000,
  "merchant": "Casino",
  "location": "Foreign Country",
  "device": "Unknown Device"
}
→ Expected: BLOCKED (score > 0.85)
```

### Test 3: Unusual Pattern
```json
{
  "accountId": 1,
  "amount": 10000,
  "merchant": "Unknown",
  "location": "Different State",
  "device": "New Device",
  "time": "3 AM"
}
→ Expected: REVIEW_PENDING (score 0.7-0.85)
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| AI service not found | Check Eureka registration, check logs |
| Kafka topic not found | Create topic with kafka-topics command |
| Model not loading | Check model path in database, verify file exists |
| High latency | Check database queries, enable caching |
| False positives | Adjust thresholds in RuleBasedFraudDetector |
| Service crashing | Check resource limits, review logs |

---

## 📞 Key Contacts

- **Architecture:** Review AI_ARCHITECTURE_DIAGRAM.md
- **Integration:** Review AI_IMPLEMENTATION_GUIDE.md
- **Strategy:** Review AI_IMPLEMENTATION_STRATEGY.md
- **Issues:** Check code comments and Javadoc

---

**Status:** Ready for implementation 🎯
**Next Step:** Start with Transaction Service + Fraud Detection integration
**Timeline:** 12 weeks for full implementation



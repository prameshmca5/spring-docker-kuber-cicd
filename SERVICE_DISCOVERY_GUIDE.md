# Service Discovery Checking Guide - Netflix Eureka

Your microservices architecture uses **Netflix Eureka** for service discovery. This guide shows how to verify that services are properly registered and discoverable.

## 1. Eureka Dashboard (Web UI)

The easiest way to check service discovery status is through the Eureka Dashboard.

### For Local Development:
```bash
# Access Eureka Dashboard
http://localhost:8761/

# You should see all registered services listed in the dashboard
# Services that appear in green are healthy
# Services that appear in red/orange may have issues
```

### For Kubernetes Deployment:
```bash
# Port-forward to access Eureka Dashboard
kubectl port-forward -n backend svc/discovery-server 8761:8761

# Then access: http://localhost:8761/
```

---

## 2. Eureka REST API - Check Registered Services

### Get All Applications Registered:
```bash
# Local
curl -s http://localhost:8761/eureka/apps | xml_pp

# Kubernetes (with port-forward)
kubectl port-forward -n backend svc/discovery-server 8761:8761
curl -s http://localhost:8761/eureka/apps | xml_pp

# Pretty print JSON version:
curl -s http://localhost:8761/eureka/apps.json | jq .
```

### Get Specific Service Instance:
```bash
# Local - Check if account-service is registered
curl -s http://localhost:8761/eureka/apps/account-service | xml_pp

# Get specific instance
curl -s http://localhost:8761/eureka/apps/ACCOUNT-SERVICE/[INSTANCE-ID] | xml_pp

# Kubernetes version (with port-forward)
curl -s http://localhost:8761/eureka/apps/account-service.json | jq .
```

### Check Service Instance Status:
```bash
# Get all instances for a service
curl -s http://localhost:8761/eureka/apps/ACCOUNT-SERVICE | jq '.application.instance[] | {instanceId: .instanceId, status: .status, ipAddr: .ipAddr, port: .port}'
```

---

## 3. Check Service Registration from Service Logs

### View service logs to verify Eureka registration:
```bash
# Local - Check account-service logs
tail -f account-service/target/logs/account-service.log | grep -i eureka

# Kubernetes - Check pod logs
kubectl logs -n backend -l app=account-service -f | grep -i eureka
```

**Expected log messages:**
```
Registering application ACCOUNT-SERVICE with eureka with initial status UP
DiscoveryClient_ACCOUNT-SERVICE/xxxx: registering service...
Successfully registered application ACCOUNT-SERVICE in group DEFAULT_ZONE
```

---

## 4. Service-to-Service Communication Check

### Using Spring Cloud OpenFeign (Already configured in your services):

**1. Check if service discovery is working through API Gateway:**
```bash
# API Gateway routes through service discovery (lb://service-name)
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/accounts/1

# Check Gateway logs for service lookup
kubectl logs -n backend -l app=api-gateway -f | grep "RoutePredicateHandlerMapping"
```

**2. Direct service-to-service call (if within cluster):**
```bash
# Using Kubernetes DNS (only within cluster)
curl http://account-service.backend.svc.cluster.local:8081/health

# From a pod inside the cluster:
kubectl exec -it <pod-name> -n backend -- sh
curl http://account-service.backend.svc.cluster.local:8081/health
```

---

## 5. Actuator Health Endpoints

Each service has Spring Boot Actuator enabled with health information:

### Check individual service health:
```bash
# Local
curl -s http://localhost:8081/actuator/health | jq .

# Kubernetes - Port-forward to service
kubectl port-forward -n backend svc/account-service 8081:8081
curl -s http://localhost:8081/actuator/health | jq .
```

**Response example:**
```json
{
  "status": "UP",
  "components": {
    "discoveryComposite": {
      "status": "UP",
      "components": {
        "discoveryClient": {
          "status": "UP",
          "details": {
            "services": [
              "account-service",
              "customer-service",
              "api-gateway",
              "discovery-server",
              "transaction-service",
              "payment-service",
              "notification-service",
              "common-service",
              "auth-service"
            ]
          }
        }
      }
    },
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL"
      }
    },
    "livenessState": { "status": "UP" },
    "readinessState": { "status": "UP" }
  }
}
```

---

## 6. Check Eureka Configuration in Services

### Verify Eureka settings are correct:

```bash
# Check the configuration in application.yml
# Services should have:
eureka:
  client:
    service-url:
      defaultZone: http://discovery-server.backend.svc.cluster.local:8761/eureka/
  instance:
    prefer-ip-address: true

# For Kubernetes deployment, check environment variables:
kubectl describe pod <service-pod> -n backend | grep EUREKA
```

---

## 7. Common Issues & Debugging

### Issue 1: Service Not Appearing in Eureka
```bash
# Check if service is running
kubectl get pods -n backend -l app=account-service

# Check service logs for Eureka errors
kubectl logs -n backend -l app=account-service | grep -i "eureka\|registr"

# Verify Eureka server is running
kubectl get pods -n backend -l app=discovery-server

# Check discovery-server logs
kubectl logs -n backend -l app=discovery-server
```

### Issue 2: Service Status is DOWN
```bash
# Check health endpoint
curl -s http://localhost:8081/actuator/health | jq '.components.livenessState'

# Check if database is accessible
curl -s http://localhost:8081/actuator/health | jq '.components.db'

# Check service configuration for correct Eureka URL
kubectl exec -it <pod-name> -n backend -- env | grep EUREKA
```

### Issue 3: Eureka Server Not Accessible
```bash
# Check Eureka service is running
kubectl get svc -n backend discovery-server

# Check Eureka pod logs
kubectl logs -n backend -l app=discovery-server -f

# Verify network connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://discovery-server.backend.svc.cluster.local:8761/eureka/apps
```

---

## 8. Kubernetes-Specific Commands

### Check all services and their endpoints:
```bash
# List all service endpoints in backend namespace
kubectl get endpoints -n backend

# Get detailed info about discovery-server service
kubectl describe svc discovery-server -n backend

# Check if discovery-server pod can be reached
kubectl get svc discovery-server -n backend -o wide
```

### Test service discovery from a pod:
```bash
# Open a terminal in a pod
kubectl exec -it <account-service-pod-name> -n backend -- /bin/sh

# Inside the pod, test:
curl http://discovery-server.backend.svc.cluster.local:8761/eureka/apps.json | jq '.applications.application[] | .name'
```

---

## 9. Monitoring Service Discovery Health

### Check Eureka metrics (Prometheus):
```bash
# If you have Prometheus set up, check these metrics:
# eureka.client.register.metrics
# eureka.client.calls
# eureka.instance.status (should be 1 for UP)

# Kubernetes - Port-forward to Prometheus if available
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Then check: http://localhost:9090/graph
# Search for: eureka_server_
```

### Check service registration in real-time:
```bash
# Watch Eureka dashboard for changes
watch 'curl -s http://localhost:8761/eureka/apps.json | jq '.applications.application[].name''

# In Kubernetes:
kubectl port-forward -n backend svc/discovery-server 8761:8761
watch 'curl -s http://localhost:8761/eureka/apps.json | jq '.applications.application[].name''
```

---

## 10. Service Discovery Configuration Reference

### Your Current Configuration:

**Discovery Server (application.yml):**
```yaml
eureka:
  instance:
    hostname: localhost  # Changes in K8s deployment
  client:
    register-with-eureka: false  # Server doesn't register itself
    fetch-registry: false         # Server doesn't fetch registry
    service-url:
      defaultZone: http://discovery-server.backend.svc.cluster.local:8761/eureka/
```

**Client Services (e.g., account-service):**
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://discovery-server.backend.svc.cluster.local:8761/eureka/
  instance:
    prefer-ip-address: true  # Use IP instead of hostname
```

**API Gateway (load-balanced routing):**
```yaml
# Routes use: uri: lb://service-name
# Example: lb://account-service -> Eureka discovery + load balancing
```

---

## 11. Quick Health Check Script

Save this as `check-discovery.sh`:

```bash
#!/bin/bash

EUREKA_URL=${1:-http://localhost:8761}
NAMESPACE=${2:-backend}

echo "=== Checking Eureka Server ==="
curl -s ${EUREKA_URL}/eureka/apps.json | jq '.applications.application[] | {name: .name, instances: (.instance | length)}'

echo ""
echo "=== Service Status Details ==="
for service in $(curl -s ${EUREKA_URL}/eureka/apps.json | jq -r '.applications.application[].name'); do
  echo "Service: $service"
  curl -s ${EUREKA_URL}/eureka/apps/${service}.json | jq '.application.instance[] | {instanceId: .instanceId, status: .status, ipAddr: .ipAddr, port: .port}'
  echo ""
done

echo "=== Kubernetes Services ==="
kubectl get svc -n ${NAMESPACE} | grep -E "account|customer|transaction|payment|discovery"

echo ""
echo "=== Kubernetes Pod Status ==="
kubectl get pods -n ${NAMESPACE} | grep -E "account|customer|transaction|payment|discovery|api-gateway"
```

**Usage:**
```bash
chmod +x check-discovery.sh

# Local
./check-discovery.sh

# Kubernetes (with port-forward)
kubectl port-forward -n backend svc/discovery-server 8761:8761 &
./check-discovery.sh http://localhost:8761 backend
```

---

## Summary - Key Indicators of Healthy Service Discovery

✅ **Service is registered:**
- Appears in Eureka Dashboard (http://localhost:8761)
- Listed in `/eureka/apps` endpoint
- Status shows "UP"

✅ **Service is discoverable:**
- Accessible via load-balanced URI `lb://service-name` from API Gateway
- Service-to-service calls work
- Actuator `/health` shows `discoveryComposite: UP`

✅ **Service logs show:**
- "Successfully registered application XXXX-SERVICE"
- No repeated "deregister" messages
- Heartbeat messages continuing

⚠️ **Potential Issues:**
- 🔴 Service not appearing in registry → check Eureka URL configuration
- 🔴 Service status DOWN → check health endpoint and dependencies
- 🔴 Cannot reach services → check network/DNS resolution
- 🔴 Eureka server down → all service discovery fails


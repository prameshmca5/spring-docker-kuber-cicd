# Quick Service Discovery Commands

## For LOCAL Development

### 1. Check Eureka Dashboard
```bash
http://localhost:8761
```

### 2. List All Registered Services
```bash
curl -s http://localhost:8761/eureka/apps.json | jq '.applications.application[] | .name'
```

### 3. Check Specific Service Status
```bash
# Account Service
curl -s http://localhost:8761/eureka/apps/ACCOUNT-SERVICE.json | jq '.application.instance[] | {instanceId, status, ipAddr, port}'

# All services
curl -s http://localhost:8761/eureka/apps.json | jq '.applications.application[] | {name, instances: ([.instance[] | select(.status == "UP")] | length), total: (.instance | length)}'
```

### 4. Check Service Health
```bash
# Account Service health
curl -s http://localhost:8081/actuator/health | jq '.'

# Discovery client status
curl -s http://localhost:8081/actuator/health | jq '.components.discoveryComposite'
```

### 5. View Service Logs
```bash
# Account Service logs
tail -f account-service/target/logs/account-service.log | grep -i "eureka\|register"
```

---

## For KUBERNETES Deployment

### 1. Port Forward to Eureka
```bash
kubectl port-forward -n backend svc/discovery-server 8761:8761
```
Then access: `http://localhost:8761`

### 2. List All Registered Services (Kubernetes)
```bash
kubectl port-forward -n backend svc/discovery-server 8761:8761 &
curl -s http://localhost:8761/eureka/apps.json | jq '.applications.application[] | .name' | sort
```

### 3. Check Service Registration in Kubernetes
```bash
# Get all pods in backend namespace
kubectl get pods -n backend

# Check if services are registered
kubectl exec -it $(kubectl get pod -n backend -l app=account-service -o jsonpath='{.items[0].metadata.name}') -n backend -- \
  curl -s http://discovery-server.backend.svc.cluster.local:8761/eureka/apps.json | jq '.applications.application[] | .name'
```

### 4. Check Service Status from Pod Logs
```bash
# Account Service logs
kubectl logs -n backend -l app=account-service -f | grep -i "eureka\|register\|heartbeat"

# Discovery Server logs
kubectl logs -n backend -l app=discovery-server -f
```

### 5. Test Service-to-Service Communication
```bash
# From account-service pod to another service
kubectl exec -it $(kubectl get pod -n backend -l app=account-service -o jsonpath='{.items[0].metadata.name}') -n backend -- \
  curl -s http://customer-service.backend.svc.cluster.local:8082/health

# Direct API call
kubectl exec -it $(kubectl get pod -n backend -l app=account-service -o jsonpath='{.items[0].metadata.name}') -n backend -- \
  curl -s http://discovery-server.backend.svc.cluster.local:8761/eureka/apps/CUSTOMER-SERVICE.json | jq '.application.instance[] | .status'
```

### 6. Port Forward to Service Health
```bash
# Account Service
kubectl port-forward -n backend svc/account-service 8081:8081
curl -s http://localhost:8081/actuator/health | jq '.components.discoveryComposite'

# Customer Service
kubectl port-forward -n backend svc/customer-service 8082:8082
curl -s http://localhost:8082/actuator/health | jq '.'
```

### 7. Check Eureka Configuration in Service
```bash
kubectl describe pod $(kubectl get pod -n backend -l app=account-service -o jsonpath='{.items[0].metadata.name}') -n backend | grep EUREKA
```

### 8. Check Kubernetes Services and Endpoints
```bash
# List all services
kubectl get svc -n backend

# Get endpoints
kubectl get endpoints -n backend | grep -E "account|customer|transaction|discovery"

# Describe discovery-server service
kubectl describe svc discovery-server -n backend
```

---

## TROUBLESHOOTING

### Service not appearing in Eureka?

```bash
# 1. Check if pod is running
kubectl get pods -n backend -l app=account-service

# 2. Check pod logs for errors
kubectl logs -n backend $(kubectl get pod -n backend -l app=account-service -o jsonpath='{.items[0].metadata.name}') | grep -i error

# 3. Check if Eureka URL is correct
kubectl describe pod $(kubectl get pod -n backend -l app=account-service -o jsonpath='{.items[0].metadata.name}') -n backend | grep EUREKA_CLIENT_SERVICEURL_DEFAULTZONE

# 4. Verify DNS resolution
kubectl exec -it $(kubectl get pod -n backend -l app=account-service -o jsonpath='{.items[0].metadata.name}') -n backend -- \
  nslookup discovery-server.backend.svc.cluster.local
```

### Service status is DOWN?

```bash
# 1. Check health endpoint
kubectl port-forward -n backend svc/account-service 8081:8081
curl -s http://localhost:8081/actuator/health | jq '.'

# 2. Check database connection
curl -s http://localhost:8081/actuator/health | jq '.components.db'

# 3. Check logs for specific errors
kubectl logs -n backend -l app=account-service | tail -50
```

### Cannot reach Eureka server?

```bash
# 1. Check if discovery-server pod is running
kubectl get pods -n backend -l app=discovery-server

# 2. Check discovery-server logs
kubectl logs -n backend -l app=discovery-server

# 3. Test connectivity from another pod
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://discovery-server.backend.svc.cluster.local:8761/eureka/apps
```

---

## EXPECTED OUTPUT

### Healthy Service Discovery:
```json
{
  "applications": {
    "application": [
      {
        "name": "ACCOUNT-SERVICE",
        "instance": [
          {
            "instanceId": "account-service-pod-xxxxx",
            "status": "UP",
            "ipAddr": "10.244.x.x",
            "port": 8081
          }
        ]
      },
      {
        "name": "CUSTOMER-SERVICE",
        "instance": [
          {
            "status": "UP",
            "ipAddr": "10.244.x.x",
            "port": 8082
          }
        ]
      }
      // ... more services
    ]
  }
}
```

All services should show `"status": "UP"`

### Healthy Service Health:
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
              "discovery-server",
              "transaction-service",
              "payment-service",
              "notification-service",
              "auth-service",
              "api-gateway",
              "common-service"
            ]
          }
        }
      }
    }
  }
}
```

---

## MONITORING

### Watch Services in Real-Time
```bash
# Local
watch 'curl -s http://localhost:8761/eureka/apps.json | jq ".applications.application[] | {name, status: ([.instance[] | select(.status == \"UP\")] | length)}/{instance | length}"'

# Kubernetes (with port-forward)
kubectl port-forward -n backend svc/discovery-server 8761:8761 &
watch 'curl -s http://localhost:8761/eureka/apps.json | jq ".applications.application[] | {name, status: ([.instance[] | select(.status == \"UP\")] | length)}/{instance | length}"'
```

### Check Heartbeats
```bash
# Monitor Eureka logs for heartbeats
kubectl logs -n backend -l app=discovery-server -f | grep -i "heartbeat\|client\|renew"
```


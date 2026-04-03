# Observability

This project now emits structured JSON logs for every Spring Boot service and supports two monitoring paths:

- Grafana + Loki + Promtail for cluster log exploration
- Elasticsearch + Kibana + Filebeat + Elastic APM for Elastic-native logs and traces

## Build and runtime defaults

- `logback`, `slf4j`, and `logstash-logback-encoder` are managed from the parent [`pom.xml`](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/pom.xml).
- The shared image entrypoint at [`docker/entrypoint.sh`](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/docker/entrypoint.sh) enables the Elastic APM Java agent when `ELASTIC_APM_ENABLED=true`.
- Kubernetes defaults for log levels, tracing, and Elastic APM live in [`helm-charts/global-config.yaml`](/Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd/helm-charts/global-config.yaml).

## Install the monitoring stack

Run:

```bash
./install-monitoring.sh
```

The script deploys:

- Prometheus
- Grafana
- Loki
- Promtail
- Jaeger
- Elasticsearch
- Kibana
- Filebeat
- Elastic APM Server

## Access logs and traces

- Grafana: `http://$(minikube ip):32000`
- Prometheus: `http://$(minikube ip):32090`
- Jaeger: `http://$(minikube ip):31686`
- Kibana: `http://$(minikube ip):30601`
- Elastic APM intake: `http://$(minikube ip):31200`

Grafana login defaults:

```text
admin / admin
```

Useful log commands:

```bash
kubectl logs -n backend deploy/account-service-blue-deployment
kubectl logs -n backend deploy/api-gateway-blue-deployment -f
kubectl get pods -n monitoring
```

## Runtime switches

- `LOGGING_LEVEL_ROOT`: root logger level for all services
- `ELASTIC_APM_ENABLED`: enables the Java agent in the container entrypoint
- `ELASTIC_APM_SERVER_URL` or `ELASTIC_APM_SERVER_URLS`: Elastic APM intake endpoint
- `MANAGEMENT_TRACING_ENABLED`: use Spring/Micrometer OTLP tracing when `true`

Current Kubernetes defaults prefer Elastic APM and disable Micrometer OTLP tracing to avoid duplicate spans. Set `MANAGEMENT_TRACING_ENABLED=true` if you want to send traces back to Jaeger instead.

#!/bin/bash
set -e
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin

NAMESPACE="monitoring"
KUBECTL=$(which kubectl || find /usr/local/bin /usr/bin /opt/homebrew/bin -name kubectl | head -n 1)
if [ -z "$KUBECTL" ]; then KUBECTL="kubectl"; fi
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DASHBOARDS_DIR="$SCRIPT_DIR/helm-charts/monitoring-stack/dashboards"

echo "========================================="
echo "   Installing Monitoring Stack"
echo "   Prometheus + Loki + Promtail + Grafana + Kafka Exporter"
echo "   Namespace: $NAMESPACE"
echo "========================================="

# Create namespace if it doesn't exist
$KUBECTL create namespace $NAMESPACE --dry-run=client -o yaml | $KUBECTL apply -f -

echo ""
echo "=> Creating Grafana dashboard ConfigMap from JSON files..."
$KUBECTL create configmap grafana-dashboards-files \
    --from-file="$DASHBOARDS_DIR/microservices-overview.json" \
    --from-file="$DASHBOARDS_DIR/kafka-pipeline.json" \
    -n $NAMESPACE \
    --dry-run=client -o yaml | $KUBECTL apply -f -

echo ""
echo "=> Deploying Prometheus (metrics backend)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/prometheus.yaml"

echo ""
echo "=> Deploying Loki (log storage backend)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/loki.yaml"

echo ""
echo "=> Deploying Promtail (log shipper DaemonSet)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/promtail.yaml"

echo ""
echo "=> Deploying Kafka Exporter (Kafka metrics for Prometheus)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/kafka-exporter.yaml"

echo ""
echo "=> Deploying Kube State Metrics (Cluster state metrics)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/kube-state-metrics.yaml"

echo ""
echo "=> Deploying Alertmanager (alert handling)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/alertmanager.yaml"

echo ""
echo "=> Deploying Node Exporter (host metrics)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/node-exporter.yaml"

echo ""
echo "=> Deploying Pushgateway (short-lived jobs)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/pushgateway.yaml"

echo ""
echo "=> Deploying Grafana (dashboards + visualisation)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/grafana.yaml"

echo ""
echo "=> Deploying Jaeger (distributed tracing)..."
$KUBECTL apply -f "$SCRIPT_DIR/helm-charts/monitoring-stack/jaeger.yaml"

echo ""
echo "=> Waiting for monitoring pods to be ready..."
$KUBECTL wait --for=condition=ready pod -l app=prometheus -n $NAMESPACE --timeout=180s || echo "⚠️  Prometheus not yet ready"
$KUBECTL wait --for=condition=ready pod -l app=loki      -n $NAMESPACE --timeout=180s || echo "⚠️  Loki not yet ready"
$KUBECTL wait --for=condition=ready pod -l app=grafana   -n $NAMESPACE --timeout=180s || echo "⚠️  Grafana not yet ready"
$KUBECTL wait --for=condition=ready pod -l app=jaeger    -n $NAMESPACE --timeout=180s || echo "⚠️  Jaeger not yet ready"

GRAFANA_URL="http://$(minikube ip 2>/dev/null || echo 'localhost'):32000"
PROMETHEUS_URL="http://$(minikube ip 2>/dev/null || echo 'localhost'):32090"
JAEGER_URL="http://$(minikube ip 2>/dev/null || echo 'localhost'):31686"

echo ""
echo "========================================="
echo "   Monitoring Stack Ready!"
echo "========================================="
echo ""
echo "  Grafana    : $GRAFANA_URL"
echo "  Prometheus : $PROMETHEUS_URL"
echo "  Jaeger     : $JAEGER_URL"
echo "  Login      : admin / admin"
echo ""
echo "  Pre-built Dashboards:"
echo "    → Spring Boot → Spring Boot Microservices Overview"
echo "    → Spring Boot → Kafka + Notification Pipeline"
echo ""
echo "  In Grafana Explore:"
echo "    → Select Loki  → {namespace=\"backend\"}"
echo "    → Select Prometheus → up{namespace=\"backend\"}"
echo ""
$KUBECTL get pods -n $NAMESPACE

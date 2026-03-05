#!/bin/bash
set -e

NAMESPACE="monitoring"
KUBECTL=$(which kubectl || echo "kubectl")

echo "========================================="
echo "   Installing Monitoring Stack"
echo "   Loki + Promtail + Grafana"
echo "   Namespace: $NAMESPACE"
echo "========================================="

# Create namespace if it doesn't exist
$KUBECTL create namespace $NAMESPACE --dry-run=client -o yaml | $KUBECTL apply -f -

echo ""
echo "=> Deploying Loki (log storage backend)..."
$KUBECTL apply -f ./helm-charts/monitoring-stack/loki.yaml

echo ""
echo "=> Deploying Promtail (log shipper DaemonSet)..."
$KUBECTL apply -f ./helm-charts/monitoring-stack/promtail.yaml

echo ""
echo "=> Deploying Grafana (log + metrics visualization)..."
$KUBECTL apply -f ./helm-charts/monitoring-stack/grafana.yaml

echo ""
echo "=> Waiting for monitoring pods to be ready..."
$KUBECTL wait --for=condition=ready pod -l app=loki -n $NAMESPACE --timeout=180s || echo "⚠️  Loki not yet ready"
$KUBECTL wait --for=condition=ready pod -l app=grafana -n $NAMESPACE --timeout=180s || echo "⚠️  Grafana not yet ready"

echo ""
echo "========================================="
echo "   Monitoring Stack Deployed!"
echo "========================================="
echo ""
echo "  Grafana URL  : http://$(minikube ip):32000"
echo "  Login        : admin / admin"
echo ""
echo "  In Grafana:"
echo "    Explore → Loki → {namespace=\"backend\"}"
echo "    Dashboards already configured for Loki + Prometheus"
echo ""
$KUBECTL get pods -n $NAMESPACE

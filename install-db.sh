#!/bin/bash
set -e
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin
NAMESPACE="db"
HELM=$(which helm || echo "helm")
KUBECTL=$(which kubectl || echo "kubectl")

echo "========================================="
echo "   Installing Database Infrastructure"
echo "========================================="

# Create namespace if it doesn't exist
$KUBECTL create namespace $NAMESPACE || true
$KUBECTL create namespace backend || true
$KUBECTL create namespace external-tools || true

echo "=> Deploying permanent storage (Retention Policy: Retain)..."
$KUBECTL apply -f ./helm-charts/permanent-storage.yaml

echo "=> Deploying global configurations..."
$KUBECTL apply -f ./helm-charts/global-config.yaml

echo "=> Deploying shared MySQL..."
$KUBECTL apply -f ./helm-charts/mysql-db.yaml

echo "=> Deploying shared Kafka..."
$KUBECTL apply -f ./helm-charts/kafka.yaml

echo "=> Cleaning up existing pods in $NAMESPACE to unblock PVCs..."
chmod +x ./force-delete-pods.sh
./force-delete-pods.sh || true

echo "=> Cleaning up existing PVCs to allow Helm to manage them..."
chmod +x ./force-delete-pvc.sh
./force-delete-pvc.sh || true
$SCRIPT_DIR/reset-pvs.sh || true
# Wait for PVCs to be truly gone
while $KUBECTL get pvc -n $NAMESPACE 2>/dev/null | grep -q .; do
  echo "Still waiting for PVCs in $NAMESPACE to be deleted..."
  sleep 2
done

echo "=> Deploying dedicated databases..."
chmod +x ./deploy-db.sh
./deploy-db.sh

echo "=> Deploying DB Umbrella Chart..."
$HELM upgrade --install springbootapp-db ./helm-charts/springbootapp-db --namespace $NAMESPACE

echo "Database layer installation completed successfully!"

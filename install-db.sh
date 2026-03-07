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
chmod +x ./reset-pvs.sh
./reset-pvs.sh || true
# Wait for PVCs to be truly gone (with timeout)
TIMEOUT=30
ELAPSED=0
while $KUBECTL get pvc -n $NAMESPACE 2>/dev/null | grep -v 'No resources found' | grep -v '^NAME' | grep -q .; do
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "Timeout reached. Automatically skipping wait for PVC deletion..."
    break
  fi
  echo "Still waiting for PVCs in $NAMESPACE to be deleted..."
  sleep 2
  ELAPSED=$((ELAPSED+2))
done

echo "=> Deploying dedicated databases..."
chmod +x ./deploy-db.sh
./deploy-db.sh

echo "=> Deploying DB Umbrella Chart..."
# Uninstall if in a failed/pending state before reinstalling to avoid 'release: already exists' error
RELEASE_STATUS=$($HELM status springbootapp-db --namespace $NAMESPACE -o json 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin)['info']['status'])" 2>/dev/null || echo "not-found")
if [ "$RELEASE_STATUS" = "failed" ] || [ "$RELEASE_STATUS" = "pending-install" ] || [ "$RELEASE_STATUS" = "pending-upgrade" ]; then
  echo "Release springbootapp-db is in '$RELEASE_STATUS' state. Uninstalling before reinstall..."
  $HELM uninstall springbootapp-db --namespace $NAMESPACE || true
fi
$HELM upgrade --install springbootapp-db ./helm-charts/springbootapp-db --namespace $NAMESPACE

echo "Database layer installation completed successfully!"

#!/bin/bash
set -e

NAMESPACE="db"
HELM="/opt/homebrew/bin/helm"

echo "========================================="
echo "   Installing Database Infrastructure"
echo "========================================="

# Create namespace if it doesn't exist
/opt/homebrew/bin/kubectl create namespace $NAMESPACE || true
/opt/homebrew/bin/kubectl create namespace backend || true
/opt/homebrew/bin/kubectl create namespace external-tools || true

echo "=> Deploying global configurations..."
/opt/homebrew/bin/kubectl apply -f ./helm-charts/global-config.yaml

echo "=> Deploying shared MySQL..."
/opt/homebrew/bin/kubectl apply -f ./helm-charts/mysql-db.yaml

echo "=> Deploying shared Kafka..."
/opt/homebrew/bin/kubectl apply -f ./helm-charts/kafka.yaml

echo "=> Deploying dedicated databases..."
./deploy-db.sh

echo "=> Deploying DB Umbrella Chart..."
$HELM upgrade --install springbootapp-db ./helm-charts/springbootapp-db --namespace $NAMESPACE

echo "Database layer installation completed successfully!"

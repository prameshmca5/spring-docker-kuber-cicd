#!/bin/bash
set -e

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

echo "=> Deploying global configurations..."
$KUBECTL apply -f ./helm-charts/global-config.yaml

echo "=> Deploying shared MySQL..."
$KUBECTL apply -f ./helm-charts/mysql-db.yaml

echo "=> Deploying shared Kafka..."
$KUBECTL apply -f ./helm-charts/kafka.yaml

echo "=> Deploying dedicated databases..."
./deploy-db.sh

echo "=> Deploying DB Umbrella Chart..."
$HELM upgrade --install springbootapp-db ./helm-charts/springbootapp-db --namespace $NAMESPACE

echo "Database layer installation completed successfully!"

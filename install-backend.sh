#!/bin/bash
set -e

NAMESPACE="backend"
HELM="/opt/homebrew/bin/helm"

echo "========================================="
echo "   Installing Backend Services"
echo "========================================="

# Create namespace if it doesn't exist
/opt/homebrew/bin/kubectl create namespace $NAMESPACE || true

echo "=> Deploying Individual Microservices..."
./deploy-all.sh

echo "=> Deploying Backend Umbrella Chart..."
$HELM upgrade --install springbootapp-backend ./helm-charts/springbootapp-backend --namespace $NAMESPACE

echo "Backend installation completed successfully!"

#!/bin/bash
set -e

NAMESPACE="frontend"
HELM="/opt/homebrew/bin/helm"

echo "========================================="
echo "   Installing Frontend Services"
echo "========================================="

# Create namespace if it doesn't exist
/opt/homebrew/bin/kubectl create namespace $NAMESPACE || true

echo "=> Deploying Frontend Umbrella Chart..."
$HELM upgrade --install springbootapp-frontend ./helm-charts/springbootapp-frontend --namespace $NAMESPACE

echo "Frontend installation completed successfully!"

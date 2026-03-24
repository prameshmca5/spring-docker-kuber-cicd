#!/bin/bash
set -e

NAMESPACE="db"
CHART_DIR="./helm-charts/dedicated-db"
HELM="/opt/homebrew/bin/helm"

echo "Deploying Dedicated Databases to namespace: $NAMESPACE"

# mysql-account
echo "=> Deploying mysql-account..."
$HELM upgrade --install mysql-account $CHART_DIR --namespace $NAMESPACE \
  --set type=mysql --set name=mysql-account --set mysql.database=account_db

# postgres-customer
echo "=> Deploying postgres-customer..."
$HELM upgrade --install postgres-customer $CHART_DIR --namespace $NAMESPACE \
  --set type=postgres --set name=postgres-customer --set postgres.database=customer_db

# mysql-transaction
echo "=> Deploying mysql-transaction..."
$HELM upgrade --install mysql-transaction $CHART_DIR --namespace $NAMESPACE \
  --set type=mysql --set name=mysql-transaction --set mysql.database=transaction_db

# mysql-common
echo "=> Deploying mysql-common..."
$HELM upgrade --install mysql-common $CHART_DIR --namespace $NAMESPACE \
  --set type=mysql --set name=mysql-common --set mysql.database=common_db

# mysql-notification
echo "=> Deploying mysql-notification..."
$HELM upgrade --install mysql-notification $CHART_DIR --namespace $NAMESPACE \
  --set type=mysql --set name=mysql-notification --set mysql.database=notification_db

# mysql-payment
echo "=> Deploying mysql-payment..."
$HELM upgrade --install mysql-payment $CHART_DIR --namespace $NAMESPACE \
  --set type=mysql --set name=mysql-payment --set mysql.database=payment_db

# mysql-card
echo "=> Deploying mysql-card..."
$HELM upgrade --install mysql-card $CHART_DIR --namespace $NAMESPACE \
  --set type=mysql --set name=mysql-card --set mysql.database=card_db

# mysql-loan
echo "=> Deploying mysql-loan..."
$HELM upgrade --install mysql-loan $CHART_DIR --namespace $NAMESPACE \
  --set type=mysql --set name=mysql-loan --set mysql.database=loan_db

# postgres-employee
echo "=> Deploying postgres-employee..."
$HELM upgrade --install postgres-employee $CHART_DIR --namespace $NAMESPACE \
  --set type=postgres --set name=postgres-employee --set postgres.database=employee_db

echo "All dedicated databases deployed successfully!"

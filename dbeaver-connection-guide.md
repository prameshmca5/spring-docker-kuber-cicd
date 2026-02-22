# DBeaver Database Connection Guide

This guide explains how to connect your local DBeaver SQL client to the various databases running inside your Minikube Kubernetes cluster.

Because the databases are running inside the Minikube virtual machine and within the cluster's internal network, your host machine cannot connect to them directly using their internal Kubernetes DNS names (e.g., `postgres-employee.db.svc.cluster.local`).

You must use Kubernetes **Port-Forwarding** to securely tunnel the internal database ports to your local machine (`localhost`).

## Prerequisites
- Minikube is running (`minikube status`).
- The database pods are running in the `db` namespace (`kubectl get pods -n db`).
- DBeaver is installed on your local machine.

---

## 1. Employee Service Database (PostgreSQL)

**Step 1: Start Port-Forwarding**
Run this command in a terminal and **leave it running**:
```bash
kubectl port-forward svc/postgres-employee 5432:5432 -n db
```

**Step 2: Connect via DBeaver**
- **Database Type:** PostgreSQL
- **Host:** `localhost`
- **Port:** `5432`
- **Database Name:** `employee_db`
- **Username:** `postgres`
- **Password:** `root`

---

## 2. Customer Service Database (PostgreSQL)

*Note: Since port `5432` is likely used by the employee database locally, we forward this to a different local port, like `5433`.*

**Step 1: Start Port-Forwarding**
Run this command in a terminal and **leave it running**:
```bash
kubectl port-forward svc/postgres-customer 5433:5432 -n db
```

**Step 2: Connect via DBeaver**
- **Database Type:** PostgreSQL
- **Host:** `localhost`
- **Port:** `5433` 
- **Database Name:** `customer_db`
- **Username:** `postgres`
- **Password:** `root`

---

## 3. Account Service Database (MySQL)

**Step 1: Start Port-Forwarding**
Run this command in a terminal and **leave it running**:
```bash
kubectl port-forward svc/mysql-account 3306:3306 -n db
```

**Step 2: Connect via DBeaver**
- **Database Type:** MySQL
- **Host:** `localhost`
- **Port:** `3306`
- **Database Name:** `account_db`
- **Username:** `root`
- **Password:** `root`

---

## 4. Transaction Service Database (MySQL)

*Note: Forward to a different local port, like `3307`.*

**Step 1: Start Port-Forwarding**
Run this command in a terminal and **leave it running**:
```bash
kubectl port-forward svc/mysql-transaction 3307:3306 -n db
```

**Step 2: Connect via DBeaver**
- **Database Type:** MySQL
- **Host:** `localhost`
- **Port:** `3307`
- **Database Name:** `transaction_db`
- **Username:** `root`
- **Password:** `root`

---

## 5. Payment Service Database (MySQL)

*Note: Forward to a different local port, like `3308`.*

**Step 1: Start Port-Forwarding**
Run this command in a terminal and **leave it running**:
```bash
kubectl port-forward svc/mysql-payment 3308:3306 -n db
```

**Step 2: Connect via DBeaver**
- **Database Type:** MySQL
- **Host:** `localhost`
- **Port:** `3308`
- **Database Name:** `payment_db`
- **Username:** `root`
- **Password:** `root`

---

## 6. Notification Service Database (MySQL)

*Note: Forward to a different local port, like `3309`.*

**Step 1: Start Port-Forwarding**
Run this command in a terminal and **leave it running**:
```bash
kubectl port-forward svc/mysql-notification 3309:3306 -n db
```

**Step 2: Connect via DBeaver**
- **Database Type:** MySQL
- **Host:** `localhost`
- **Port:** `3309`
- **Database Name:** `notification_db`
- **Username:** `root`
- **Password:** `root`

---

## 7. Common Service Database (MySQL)

*Note: Forward to a different local port, like `3310`.*

**Step 1: Start Port-Forwarding**
Run this command in a terminal and **leave it running**:
```bash
kubectl port-forward svc/mysql-common 3310:3306 -n db
```

**Step 2: Connect via DBeaver**
- **Database Type:** MySQL
- **Host:** `localhost`
- **Port:** `3310`
- **Database Name:** `common_db`
- **Username:** `root`
- **Password:** `root`

---

## Troubleshooting

- **Connection Refused:** Ensure the `kubectl port-forward` command is actively running in a terminal. If it exits or crashes, you will lose the connection in DBeaver.
- **Port already in use:** If a port like `3306` or `5432` is already being used by an application on your Mac, change the *first* number in the port-forward command. For example, use `kubectl port-forward svc/postgres-employee 5499:5432 -n db` and connect DBeaver using port `5499`.

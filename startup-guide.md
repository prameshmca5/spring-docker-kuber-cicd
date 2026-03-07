# System Startup Guide (After Restart)

When you restart your Mac, Minikube and your port-forwards will stop. Follow these steps to bring your local Kubernetes environment back online and access your application.

## 1. Start Minikube
Open a terminal and start your Minikube cluster:
```bash
minikube start --driver=docker
```

## 2. Verify Kubernetes is Running
Ensure all your pods and services start correctly (it may take a minute or two for everything to go from `Pending` to `Running` depending on your Mac's resources):
```bash
kubectl get pods -A
```

## 3. Expose the Ingress Controller (Frontend Access)
To access your frontend via `http://qactsai.local`, you need to expose the NGINX Ingress controller. 

Since port `80` requires `sudo` (Administrator) and port `8080` is used by Jenkins, we will port-forward to `8888`.

**Run this command and let it run in the background (or open a dedicated terminal window for it):**
```bash
kubectl port-forward --namespace=ingress-nginx service/ingress-nginx-controller 8888:80
```
*(Leave this terminal window open if you didn't append `&` to run it in the background)*

## 4. Access the Application
You can now access your application in your browser:
* **Frontend / Login:** http://qactsai.local:8888/login

## 5. (Optional) Run Jenkins
If you need your local Jenkins CI/CD pipeline, start its Docker Compose stack if it hasn't started automatically:
```bash
cd /Users/rohit/JavaApplication/newSpringKuber/spring-docker-kuber-cicd
docker-compose -f docker-compose-jenkins.yml up -d
```
Access Jenkins at: http://localhost:8080

## 5. Expose Databases (Optional)
If you need to connect your local SQL client (like DBeaver or PgAdmin) to your databases, you will need to port-forward them as well. 

Open a new terminal window for each database you want to access and run the respective command:

**MySQL (Account Service):**
```bash
kubectl port-forward --namespace=db service/mysql-account 3306:3306
```
*(Connect via `localhost:3306` with your MySQL tools)*

**PostgreSQL (Customer Service):**
```bash
kubectl port-forward --namespace=db service/postgres-customer 5432:5432
```
*(Connect via `localhost:5432` with your PostgreSQL tools)*

> **Note:** Because you have multiple MySQL and Postgres databases in your cluster, each one will need to be forwarded to a distinct local port if you want to connect to them simultaneously. For example: `kubectl port-forward --namespace=db service/mysql-payment 3307:3306`.

## 5. Expose Databases (Optional)
If you need to connect your local SQL client (like DBeaver or PgAdmin) to your databases, you will need to port-forward them. 

I've already created a comprehensive guide for all databases! You can read the specific commands and connection details here:
👉 **[DBeaver Connection Guide](dbeaver-connection-guide.md)**

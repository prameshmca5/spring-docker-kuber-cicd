# Blue-Green Deployment & Terminal Customization Guide

This guide explains how to use the new "Blue-Green" deployment features and the centralized terminal color theme.

---

## 🎨 1. Terminal Differentiation (Colors)

I have centralized all terminal colors into `colors.sh`. This allows you to differentiate stages and status easily.

### Key Theme Variables:
*   `${HEADER}`: Used for main step titles (Default: **Bold Blue**)
*   `${SUCCESS}`: Used for successful operations (Default: **Bold Green**)
*   `${INFO}`: Used for details and hints (Default: **Bold Cyan**)
*   `${ACTION}`: Used for commands you need to run (Default: **Blue**)

### How to customize:
Edit the `colors.sh` file. You can change the assignments at the bottom of the file to swap the look of all your scripts instantly.

---

## 🚀 2. Blue-Green Deployment Strategy

You can now run two versions of the same service (Blue and Green) side-by-side and swap traffic between them with zero downtime.

### Step 1: Deploy the "Blue" Version
```bash
./deploy-service.sh account-service backend blue
```
This creates a deployment named `account-service-blue-deployment` and sets the service selector to `color: blue`.

### Step 2: Deploy the "Green" Version (New code/version)
```bash
./deploy-service.sh account-service backend green
```
This creates a parallel deployment named `account-service-green-deployment`. **Traffic is still going to Blue at this point.**

### Step 3: Test Green
You can verify the green pods are running:
```bash
kubectl get pods -n backend -l color=green
```

### Step 4: Switch Traffic to Green
Use the new switch script:
```bash
chmod +x switch-traffic.sh
./switch-traffic.sh account-service green
```
This instantly patches the Kubernetes Service to point to the Green pods.

### Step 5: Rollback (If needed)
If something is wrong with Green, instantly swap back:
```bash
./switch-traffic.sh account-service blue
```

---

## 🛠️ Summary of New Files
1.  `colors.sh`: Central color definitions.
2.  `switch-traffic.sh`: Traffic toggling script.
3.  `blue-green-guide.md`: This guide.

## Updated Files
1.  `local-startup.sh`: Now uses central colors.
2.  `deploy-service.sh`: Now supports color-based deployments.
3.  `helm-charts/banking-service/templates/`: Updated to support `color` labels and selectors.

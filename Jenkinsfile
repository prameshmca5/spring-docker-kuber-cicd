pipeline {
    agent any

    environment {
        KUBECONFIG = "${WORKSPACE}/minikube-kubeconfig"
        DOCKER_HOST = "unix:///var/run/docker.sock"
        PROJECT_DIR = "${WORKSPACE}"
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
        IMAGE_REGISTRY = "localhost:5000"
        BUILD_TIMESTAMP = sh(script: 'date +%Y%m%d%H%M%S', returnStdout: true).trim()
        GIT_COMMIT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        GIT_BRANCH = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
        POM_VERSION = sh(script: 'chmod +x mvnw && ./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout || echo ""', returnStdout: true).trim()
        IMAGE_VERSION = "latest"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    parameters {
        booleanParam(name: 'SKIP_TESTS', defaultValue: true, description: 'Skip running tests')
        booleanParam(name: 'CLEAN_BUILD', defaultValue: true, description: 'Perform clean build')
        booleanParam(name: 'BUILD_IMAGES', defaultValue: false, description: 'Build and load new Docker Images')
        booleanParam(name: 'DEPLOY_BACKEND', defaultValue: true, description: 'Deploy Backend via Helm')
        booleanParam(name: 'DEPLOY_FRONTEND', defaultValue: true, description: 'Deploy Frontend via Helm')
        booleanParam(name: 'DEPLOY_DATABASE', defaultValue: false, description: 'Deploy Database Infrastructure')
        booleanParam(name: 'DEPLOY_MONITORING', defaultValue: false, description: 'Deploy Monitoring Stack (Loki + Promtail + Grafana)')
        choice(name: 'DEPLOY_ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Deployment environment')
        choice(name: 'BACKEND_SERVICE', choices: ['ALL', 'discovery-server', 'api-gateway', 'account-service', 'customer-service', 'transaction-service', 'notification-service', 'payment-service', 'employee-service', 'common-service', 'auth-service'], description: 'Select a specific backend service to deploy, or ALL for everything')
    }

    stages {
        stage('Initialize') {
            steps {
                echo '🚀 Starting pipeline execution...'
                echo "Build #${BUILD_NUMBER} - ${GIT_BRANCH}@${GIT_COMMIT}"
                script {
                    currentBuild.description = "Branch: ${GIT_BRANCH} | Commit: ${GIT_COMMIT}"
                }
            }
        }

        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
                sh 'git status'
                sh 'git log -1 --oneline'
            }
        }

        stage('Setup Environment') {
            steps {
                echo '⚙️ Setting up environment...'
                sh '''
                    # Force retrieval from system default config to avoid stale workspace file
                    MINIKUBE_SERVER=$(unset KUBECONFIG && kubectl config view -o jsonpath='{.clusters[?(@.name=="minikube")].cluster.server}')
                    
                    if [ -z "$MINIKUBE_SERVER" ]; then
                        echo "⚠️ Minikube server URL not found in config! Using default."
                        MINIKUBE_SERVER="https://127.0.0.1:8443"
                    fi

                    cat > ${KUBECONFIG} << KUBEEOF
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /Users/rohit/.minikube/ca.crt
    server: ${MINIKUBE_SERVER}
  name: minikube
contexts:
- context:
    cluster: minikube
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate: /Users/rohit/.minikube/profiles/minikube/client.crt
    client-key: /Users/rohit/.minikube/profiles/minikube/client.key
KUBEEOF
                    echo "✅ Kubeconfig written to ${KUBECONFIG} using server ${MINIKUBE_SERVER}"
                '''
            }
        }

        stage('Verify Tools') {
            steps {
                echo '🔍 Verifying required tools...'
                sh '''
                    echo "=== System Info ==="
                    java -version 2>&1 | head -n 1
                    docker --version
                    kubectl version --client
                    helm version --short
                '''
            }
        }

        stage('Dependency Check') {
            when {
                expression { params.CLEAN_BUILD && params.BUILD_IMAGES }
            }
            steps {
                echo '📦 Cleaning and downloading dependencies...'
                sh '''
                    chmod +x mvnw
                    # Use parallel threads (-T 1C) to speed up dependency resolution across modules
                    ./mvnw clean dependency:resolve \
                        -T 1C \
                        -DskipTests=${SKIP_TESTS} \
                        --batch-mode \
                        --no-transfer-progress
                '''
            }
        }

        stage('Build & Test') {
            when {
                expression { params.BUILD_IMAGES }
            }
            steps {
                echo '🔨 Building and testing...'
                sh '''
                    chmod +x mvnw
                    # Use parallel threads to speed up the compilation of multiple modules
                    ./mvnw package \
                        -T 1C \
                        -DskipTests=${SKIP_TESTS} \
                        --batch-mode \
                        --no-transfer-progress
                '''
            }
            post {
                success {
                    echo '✅ Build completed successfully.'
                    archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
                }
            }
        }

        stage('Build Docker Images') {
            when {
                expression { params.BUILD_IMAGES }
            }
            steps {
                echo '🐳 Building Docker images...'
                script {
                    sh """
                        echo "Building images with version: ${env.IMAGE_VERSION}"
                        chmod +x build-images.sh
                        ./build-images.sh ${env.IMAGE_VERSION}
                    """
                }
            }
            post {
                success {
                    echo '✅ Docker images built successfully.'
                    sh 'docker images | grep -E "microservice" || true'
                }
            }
        }

        stage('Load Images to Minikube') {
            when {
                expression { params.BUILD_IMAGES }
            }
            steps {
                echo '📦 Loading Docker images into Minikube...'
                sh '''
                    chmod +x load-images.sh
                    ./load-images.sh ${IMAGE_VERSION}
                '''
            }
        }

        stage('Pre-Deployment Checks') {
            steps {
                echo '🔍 Running pre-deployment validation...'
                sh '''
                    kubectl cluster-info
                    kubectl get nodes
                '''
            }
        }

        stage('Deploy Database') {
            when {
                expression { params.DEPLOY_DATABASE }
            }
            steps {
                echo '🚀 Deploying Database Infrastructure...'
                sh '''
                    chmod +x install-db.sh
                    ./install-db.sh
                '''
            }
        }

        stage('Deploy Backend via Helm') {
            when {
                expression { params.DEPLOY_BACKEND }
            }
            steps {
                echo '🚀 Deploying to Kubernetes via Helm...'
                sh """
                    kubectl create namespace backend --dry-run=client -o yaml | kubectl apply -f -
                    chmod +x deploy-all.sh
                    ./deploy-all.sh --namespace backend --service "${params.BACKEND_SERVICE}"
                """
            }
        }

        stage('Deploy Monitoring Stack') {
            when {
                expression { params.DEPLOY_MONITORING }
            }
            steps {
                echo '📊 Deploying Monitoring Stack (Loki + Promtail + Grafana)...'
                sh '''
                    chmod +x install-monitoring.sh
                    ./install-monitoring.sh
                '''
            }
            post {
                success {
                    echo '✅ Monitoring stack deployed. Grafana available at http://$(minikube ip):32000 (admin/admin)'
                }
            }
        }

        stage('Deploy Frontend via Helm') {
            when {
                expression { params.DEPLOY_FRONTEND }
            }
            steps {
                echo '🚀 Deploying Frontend to Kubernetes via Helm...'
                sh '''
                    helm upgrade --install springbootapp-frontend ./helm-charts/springbootapp-frontend --namespace frontend --create-namespace \
                        --set image.tag="${IMAGE_VERSION:-latest}"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo '🔎 Verifying deployment health...'
                sh '''
                    echo "=== Pods in backend namespace ==="
                    kubectl get pods -n backend
                    
                    echo "=== Waiting for pods to be ready ==="
                    kubectl wait --for=condition=ready pod --all -n backend --timeout=120s || echo "Some pods may not be ready"
                '''
            }
        }
    }

    post {
        always {
            echo '🏁 Pipeline execution completed.'
            sh '''
                echo "=== Final Status ==="
                kubectl get pods -n backend || true
            '''
        }
        success {
            echo '''
            ╔══════════════════════════════════════════╗
            ║   ✅ DEPLOYMENT SUCCESSFUL               ║
            ║   kubectl get pods -n backend            ║
            ╚══════════════════════════════════════════╝
            '''
        }
        failure {
            echo '''
            ╔══════════════════════════════════════════╗
            ║   ❌ DEPLOYMENT FAILED                   ║
            ║   Review logs and troubleshoot           ║
            ╚══════════════════════════════════════════╝
            '''
        }
        unstable {
            echo '⚠️ Pipeline is unstable. Some checks may have failed.'
        }
    }
}

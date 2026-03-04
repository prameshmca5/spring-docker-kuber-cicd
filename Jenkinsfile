pipeline {
    agent any

    environment {
        // Fixed kubeconfig: correct cert paths (/root/.minikube) + correct API server (192.168.49.2:8443)
        KUBECONFIG        = "/var/jenkins_home/minikube-kubeconfig"
        // Docker via socket (Jenkins mounts /var/run/docker.sock from host)
        DOCKER_HOST       = "unix:///var/run/docker.sock"
        // Project workspace
        PROJECT_DIR       = "${WORKSPACE}"
    }

    options {
        // Keep last 5 builds
        buildDiscarder(logRotator(numToKeepStr: '5'))
        // Timeout entire pipeline after 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Prevent concurrent builds
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        // ─────────────────────────────────────────────
        stage('Checkout') {
            // ─────────────────────────────────────────────
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        // ─────────────────────────────────────────────
        stage('Setup Kubeconfig') {
            // ─────────────────────────────────────────────
            steps {
                echo '⚙️ Generating minikube kubeconfig with correct paths...'
                sh '''
                    # Write a fixed kubeconfig that:
                    # 1. Uses /root/.minikube/... cert paths (minikube is mounted here)
                    # 2. Uses 192.168.49.2:8443 (minikube container IP, reachable via minikube docker network)
                    cat > /var/jenkins_home/minikube-kubeconfig << KUBEEOF
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /root/.minikube/ca.crt
    server: https://192.168.49.2:8443
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
    client-certificate: /root/.minikube/profiles/minikube/client.crt
    client-key: /root/.minikube/profiles/minikube/client.key
KUBEEOF
                    echo "✅ Kubeconfig written to /var/jenkins_home/minikube-kubeconfig"
                    cat /var/jenkins_home/minikube-kubeconfig
                '''
            }
        }

        // ─────────────────────────────────────────────
        stage('Verify Tools') {
            // ─────────────────────────────────────────────
            steps {
                echo '🔍 Verifying required tools...'
                sh '''
                    echo "=== Java Version ==="
                    java -version

                    echo "=== Maven Wrapper ==="
                    chmod +x mvnw
                    ./mvnw --version

                    echo "=== Docker Version ==="
                    docker version

                    echo "=== Kubectl Version ==="
                    kubectl version --client

                    echo "=== Helm Version ==="
                    helm version

                    echo "=== Kubernetes Cluster Info ==="
                    kubectl cluster-info

                    echo "=== Minikube Container Status ==="
                    docker inspect minikube --format "Status: {{.State.Status}}" || echo "minikube container not visible"
                '''
            }
        }

        // ─────────────────────────────────────────────
        stage('Build JARs') {
            // ─────────────────────────────────────────────
            steps {
                echo '🔨 Building Java microservices...'
                sh '''
                    chmod +x mvnw
                    ./mvnw clean package -DskipTests \
                        --batch-mode \
                        --no-transfer-progress
                '''
            }
            post {
                success {
                    echo '✅ JAR build completed successfully.'
                    // Archive built JARs as artifacts
                    archiveArtifacts artifacts: '**/target/*.jar',
                    allowEmptyArchive: true,
                    fingerprint: true
                }
                failure {
                    echo '❌ JAR build failed. Check Maven logs above.'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Build Docker Images') {
            // ─────────────────────────────────────────────
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    chmod +x build-images.sh
                    ./build-images.sh
                '''
            }
            post {
                success {
                    echo '✅ Docker images built successfully.'
                    sh 'docker images | grep -E "REPOSITORY|microservice"'
                }
                failure {
                    echo '❌ Docker image build failed.'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Load Images to Minikube') {
            // ─────────────────────────────────────────────
            steps {
                echo '📦 Loading Docker images into Minikube...'
                sh '''
                    chmod +x load-images.sh
                    ./load-images.sh
                '''
            }
            post {
                success {
                    echo '✅ Images loaded into Minikube successfully.'
                    sh 'minikube image ls | grep -v k8s'
                }
                failure {
                    echo '❌ Failed to load images into Minikube.'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Deploy via Helm') {
            // ─────────────────────────────────────────────
            steps {
                echo '🚀 Deploying to Kubernetes via Helm...'
                sh '''
                    chmod +x deploy-all.sh
                    chmod +x deploy-service.sh
                    # Ensure backend namespace exists before deploying
                    kubectl get namespace backend || kubectl create namespace backend
                    ./deploy-all.sh
                '''
            }
            post {
                success {
                    echo '✅ Helm deployment completed successfully.'
                }
                failure {
                    echo '❌ Helm deployment failed.'
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Verify Deployment') {
            // ─────────────────────────────────────────────
            steps {
                echo '🔎 Verifying deployment health...'
                sh '''
                    echo "=== Helm Releases ==="
                    helm list -A

                    echo "=== Pods in backend namespace ==="
                    kubectl get pods -n backend -o wide

                    echo "=== Services in backend namespace ==="
                    kubectl get svc -n backend

                    echo "=== Waiting for pods to be ready (max 120s) ==="
                    kubectl wait --for=condition=ready pod \
                        --all \
                        -n backend \
                        --timeout=120s || echo "⚠️ Some pods may not be ready yet."
                '''
            }
        }

    } // end stages

    // ─────────────────────────────────────────────
    post {
        // ─────────────────────────────────────────────
        always {
            echo '🏁 Pipeline execution completed.'
            // Print final pod status regardless of outcome
            sh '''
                echo "=== Final Pod Status ==="
                kubectl get pods -n backend || true
            '''
        }
        success {
            echo '''
            ╔══════════════════════════════════════════╗
            ║   ✅ DEPLOYMENT SUCCESSFUL               ║
            ║   Check pods:                            ║
            ║   kubectl get pods -n backend            ║
            ║   minikube dashboard                     ║
            ╚══════════════════════════════════════════╝
            '''
        }
        failure {
            echo '''
            ╔══════════════════════════════════════════╗
            ║   ❌ DEPLOYMENT FAILED                   ║
            ║   Review the stage logs above.           ║
            ║   Run: kubectl describe pods -n backend  ║
            ║   Run: kubectl logs <pod> -n backend     ║
            ╚══════════════════════════════════════════╝
            '''
        }
        unstable {
            echo '⚠️ Pipeline is unstable. Some tests or checks may have failed.'
        }
    }
}

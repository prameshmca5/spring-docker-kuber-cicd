pipeline {
    agent any

    // ✅ REMOVED tools {} block entirely
    // We use ./mvnw wrapper instead of a globally configured Maven/JDK tool
    // If JDK is needed, install it directly on the Jenkins agent/container

    environment {
        KUBECONFIG              = "/root/.kube/config"
        DOCKER_TLS_VERIFY       = "1"
        DOCKER_HOST             = "tcp://192.168.49.2:2376"
        DOCKER_CERT_PATH        = "/root/.minikube/certs"
        MINIKUBE_ACTIVE_DOCKERD = "minikube"
        PROJECT_DIR             = "${WORKSPACE}"
        JAVA_HOME               = "/usr/lib/jvm/java-17-openjdk-amd64"  // ✅ Set manually
        PATH                    = "${JAVA_HOME}/bin:${PATH}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
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

                    echo "=== Minikube Status ==="
                    minikube status
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
            sh '''
                echo "=== Final Pod Status ==="
                kubectl get pods -n backend || true
            '''
        }
        success {
            echo '''
            ╔══════════════════════════════════════════╗
            ║   ✅ DEPLOYMENT SUCCESSFUL               ║
            ║   kubectl get pods -n backend            ║
            ║   minikube dashboard                     ║
            ╚══════════════════════════════════════════╝
            '''
        }
        failure {
            echo '''
            ╔══════════════════════════════════════════╗
            ║   ❌ DEPLOYMENT FAILED                   ║
            ║   kubectl describe pods -n backend       ║
            ║   kubectl logs <pod> -n backend          ║
            ╚══════════════════════════════════════════╝
            '''
        }
    }
}

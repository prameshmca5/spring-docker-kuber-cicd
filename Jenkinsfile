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
        choice(name: 'DEPLOY_ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Deployment environment')
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
                    cat > ${KUBECONFIG} << 'KUBEEOF'
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /Users/rohit/.minikube/ca.crt
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
    client-certificate: /Users/rohit/.minikube/profiles/minikube/client.crt
    client-key: /Users/rohit/.minikube/profiles/minikube/client.key
KUBEEOF
                    echo "✅ Kubeconfig written to ${KUBECONFIG}"
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
                    kubectl version --client --short
                    helm version --short
                '''
            }
        }

        stage('Dependency Check') {
            when {
                expression { params.CLEAN_BUILD }
            }
            steps {
                echo '📦 Cleaning and downloading dependencies...'
                sh '''
                    chmod +x mvnw
                    ./mvnw clean dependency:resolve \
                        -DskipTests=${SKIP_TESTS} \
                        --batch-mode \
                        --no-transfer-progress
                '''
            }
        }

        stage('Build & Test') {
            steps {
                echo '🔨 Building and testing...'
                sh '''
                    chmod +x mvnw
                    ./mvnw package \
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
            steps {
                echo '🐳 Building Docker images...'
                script {
                    def version = sh(script: './mvnw help:evaluate -Dexpression=project.version -q -DforceStdout', returnStdout: true).trim()
                    if (version == "" || version.contains("\$")) {
                        version = "${BUILD_TIMESTAMP}-${GIT_COMMIT}"
                    }
                    env.IMAGE_VERSION = version
                    
                    sh """
                        echo "Building images with version: ${version}"
                        chmod +x build-images.sh
                        ./build-images.sh ${version}
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

        stage('Deploy via Helm') {
            steps {
                echo '🚀 Deploying to Kubernetes via Helm...'
                sh '''
                    kubectl create namespace backend --dry-run=client -o yaml | kubectl apply -f -
                    chmod +x deploy-all.sh
                    ./deploy-all.sh --namespace backend
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

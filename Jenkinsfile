pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '10'))
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    parameters {
        booleanParam(name: 'SKIP_TESTS', defaultValue: true, description: 'Skip Maven tests')
        booleanParam(name: 'BUILD_ARTIFACTS', defaultValue: false, description: 'Build Maven artifacts before image/deploy stages')
        booleanParam(name: 'CLEAN_EXISTING_IMAGES', defaultValue: true, description: 'Delete existing project Docker images before build/load')
        booleanParam(name: 'BUILD_IMAGES', defaultValue: false, description: 'Build Docker images')
        booleanParam(name: 'LOAD_IMAGES_TO_MINIKUBE', defaultValue: false, description: 'Force-load Docker images into Minikube')

        booleanParam(name: 'DEPLOY_DATABASE', defaultValue: false, description: 'Deploy DB stack')
        booleanParam(name: 'DEPLOY_BACKEND', defaultValue: true, description: 'Deploy backend services')
        booleanParam(name: 'DEPLOY_FRONTEND', defaultValue: false, description: 'Deploy frontend service')
        booleanParam(name: 'DEPLOY_MONITORING', defaultValue: false, description: 'Deploy monitoring stack')

        choice(name: 'BACKEND_SERVICE', choices: [
            'ALL',
            'discovery-server',
            'api-gateway',
            'account-service',
            'customer-service',
            'transaction-service',
            'notification-service',
            'payment-service',
            'employee-service',
            'common-service',
            'auth-service'
        ], description: 'Backend service to deploy, or ALL')

        string(name: 'IMAGE_TAG', defaultValue: 'latest', trim: true, description: 'Docker image tag')
        choice(name: 'DEPLOY_ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Environment label for deployment metadata')
    }

    environment {
        KUBECONFIG = "${WORKSPACE}/minikube-kubeconfig"
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Initialize') {
            steps {
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.GIT_BRANCH_NAME = sh(script: 'git rev-parse --abbrev-ref HEAD', returnStdout: true).trim()
                    currentBuild.description = "${params.DEPLOY_ENVIRONMENT} | ${env.GIT_BRANCH_NAME}@${env.GIT_COMMIT_SHORT} | tag=${params.IMAGE_TAG}"
                }
                echo "Build #${BUILD_NUMBER}"
                echo "Branch: ${env.GIT_BRANCH_NAME}"
                echo "Commit: ${env.GIT_COMMIT_SHORT}"
                echo "Environment: ${params.DEPLOY_ENVIRONMENT}"
            }
        }

        stage('Setup Kubeconfig') {
            when {
                expression {
                    return params.DEPLOY_DATABASE || params.DEPLOY_BACKEND || params.DEPLOY_FRONTEND || params.DEPLOY_MONITORING || params.LOAD_IMAGES_TO_MINIKUBE
                }
            }
            steps {
                sh '''
                    MINIKUBE_SERVER=$(unset KUBECONFIG && kubectl config view -o jsonpath='{.clusters[?(@.name=="minikube")].cluster.server}')

                    if [ -z "$MINIKUBE_SERVER" ]; then
                      echo "Minikube server URL not found, fallback to https://127.0.0.1:8443"
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

                    echo "Kubeconfig written: ${KUBECONFIG}"
                '''
            }
        }

        stage('Verify Tooling') {
            steps {
                sh '''
                    java -version 2>&1 | head -n 1
                    docker --version
                    kubectl version --client
                    helm version --short
                '''
            }
        }

        stage('Build Artifacts') {
            when {
                expression { return params.BUILD_ARTIFACTS }
            }
            steps {
                sh '''
                    chmod +x mvnw
                    MVN_ARGS="clean package --batch-mode --no-transfer-progress"
                    if [ "${SKIP_TESTS}" = "true" ]; then
                      MVN_ARGS="$MVN_ARGS -DskipTests"
                    fi
                    ./mvnw $MVN_ARGS
                '''
            }
            post {
                success {
                    archiveArtifacts artifacts: '**/target/*.jar', fingerprint: true
                }
            }
        }

        stage('Clean Existing Images') {
            when {
                expression { return params.CLEAN_EXISTING_IMAGES && (params.BUILD_IMAGES || params.LOAD_IMAGES_TO_MINIKUBE) }
            }
            steps {
                sh '''
                    IMAGE_LIST="
                    springbootapps-discovery-server:${IMAGE_TAG}
                    springbootapps-api-gateway:${IMAGE_TAG}
                    springbootapps-account-service:${IMAGE_TAG}
                    springbootapps-customer-service:${IMAGE_TAG}
                    springbootapps-transaction-service:${IMAGE_TAG}
                    springbootapps-notification-service:${IMAGE_TAG}
                    springbootapps-payment-service:${IMAGE_TAG}
                    springbootapps-common-service:${IMAGE_TAG}
                    springbootapps-employee-service:${IMAGE_TAG}
                    springbootapps-auth-service:${IMAGE_TAG}
                    springbootapps-react-frontend:${IMAGE_TAG}
                    "

                    for IMAGE in $IMAGE_LIST; do
                      if command -v docker >/dev/null 2>&1; then
                        docker image rm -f "$IMAGE" >/dev/null 2>&1 || true
                      fi

                      if command -v minikube >/dev/null 2>&1; then
                        minikube image rm "$IMAGE" >/dev/null 2>&1 || true
                      fi
                    done
                '''
            }
        }

        stage('Build Docker Images') {
            when {
                expression { return params.BUILD_IMAGES }
            }
            steps {
                sh '''
                    chmod +x build-images.sh
                    ./build-images.sh "${IMAGE_TAG}"
                '''
            }
        }

        stage('Load Images to Minikube') {
            when {
                expression { return params.LOAD_IMAGES_TO_MINIKUBE }
            }
            steps {
                sh '''
                    chmod +x load-images.sh
                    ./load-images.sh "${IMAGE_TAG}"
                '''
            }
        }

        stage('Pre-Deploy Validation') {
            when {
                expression {
                    return params.DEPLOY_DATABASE || params.DEPLOY_BACKEND || params.DEPLOY_FRONTEND || params.DEPLOY_MONITORING
                }
            }
            steps {
                sh '''
                    kubectl cluster-info
                    kubectl get nodes

                    kubectl create namespace backend --dry-run=client -o yaml | kubectl apply -f -
                    kubectl create namespace frontend --dry-run=client -o yaml | kubectl apply -f -
                    kubectl create namespace db --dry-run=client -o yaml | kubectl apply -f -
                    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
                    kubectl create namespace external-tools --dry-run=client -o yaml | kubectl apply -f -
                '''
            }
        }

        stage('Deploy Database') {
            when {
                expression { return params.DEPLOY_DATABASE }
            }
            steps {
                sh '''
                    chmod +x install-db.sh
                    ./install-db.sh
                '''
            }
        }

        stage('Deploy Backend') {
            when {
                expression { return params.DEPLOY_BACKEND }
            }
            steps {
                sh '''
                    chmod +x deploy-all.sh
                    ./deploy-all.sh --namespace backend --service "${BACKEND_SERVICE}"
                '''
            }
        }

        stage('Deploy Frontend') {
            when {
                expression { return params.DEPLOY_FRONTEND }
            }
            steps {
                sh '''
                    helm upgrade --install springbootapp-frontend ./helm-charts/springbootapp-frontend \
                        --namespace frontend \
                        --create-namespace \
                        --set image.tag="${IMAGE_TAG}"
                '''
            }
        }

        stage('Deploy Monitoring') {
            when {
                expression { return params.DEPLOY_MONITORING }
            }
            steps {
                sh '''
                    chmod +x install-monitoring.sh
                    ./install-monitoring.sh
                '''
            }
        }

        stage('Verify Deployments') {
            when {
                expression {
                    return params.DEPLOY_DATABASE || params.DEPLOY_BACKEND || params.DEPLOY_FRONTEND || params.DEPLOY_MONITORING
                }
            }
            steps {
                sh '''
                    echo "=== backend ==="
                    kubectl get pods -n backend || true
                    echo "=== frontend ==="
                    kubectl get pods -n frontend || true
                    echo "=== db ==="
                    kubectl get pods -n db || true
                    echo "=== monitoring ==="
                    kubectl get pods -n monitoring || true

                    if [ "${DEPLOY_BACKEND}" = "true" ]; then
                      kubectl wait --for=condition=ready pod --all -n backend --timeout=180s || true
                    fi
                    if [ "${DEPLOY_FRONTEND}" = "true" ]; then
                      kubectl wait --for=condition=ready pod --all -n frontend --timeout=180s || true
                    fi
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Deployment pipeline succeeded.'
        }
        failure {
            echo 'Deployment pipeline failed. Review stage logs.'
        }
    }
}

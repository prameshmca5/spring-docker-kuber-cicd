pipeline {
    agent any

    tools {
        // Requires configuring Maven tool in Jenkins Global Tool Configuration
        // Name it 'Maven 3.8.x' or adapt this line, or we can use the project's mvnw
        // Since we have mvnw, we don't strictly need a global tool.
    }

    environment {
        // Minikube uses these paths internally. Ensure Jenkins container mounts these correctly.
        KUBECONFIG = "/root/.kube/config"
    }

    stages {
        stage('Checkout') {
            steps {
                // If using a Git SCM configured in Jenkins:
                checkout scm
                // Alternatively, if you are mapping a local volume to /workspace, you might just:
                // dir('/workspace') { ... }
            }
        }

        stage('Build JARs') {
            steps {
                echo 'Building Java microservices...'
                sh 'chmod +x mvnw'
                sh './mvnw clean package -DskipTests'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images...'
                sh 'chmod +x build-images.sh'
                sh './build-images.sh'
            }
        }

        stage('Load Images to Minikube') {
            steps {
                echo 'Loading images into Minikube...'
                sh 'chmod +x load-images.sh'
                sh './load-images.sh'
            }
        }

        stage('Deploy via Helm') {
            steps {
                echo 'Deploying to Kubernetes via Helm...'
                sh 'chmod +x deploy-all.sh'
                sh 'chmod +x deploy-service.sh'
                sh './deploy-all.sh'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Deployment successful. Ensure you check the pods using kubectl get pods -n backend.'
        }
        failure {
            echo 'Deployment failed. Check the logs.'
        }
    }
}

pipeline {
    agent any

    environment {
        JAVA_HOME = sh(script: '/usr/libexec/java_home -v 25', returnStdout: true).trim()
        PATH = "${JAVA_HOME}/bin:/usr/local/bin:/opt/homebrew/bin:${env.PATH}"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Checking out source code...'
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                sh '''
                    echo "=== Java Version ==="
                    java -version
                    echo "=== Maven Wrapper ==="
                    chmod +x mvnw
                    ./mvnw --version
                    echo "=== Docker Version ==="
                    docker --version
                    echo "=== kubectl Version ==="
                    kubectl version --client
                    echo "=== Helm Version ==="
                    helm version
                '''
            }
        }

        stage('Build JARs') {
            steps {
                sh './mvnw clean package -DskipTests'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t your-image-name .'
            }
        }

        stage('Load Images to Minikube') {
            steps {
                sh 'minikube image load your-image-name'
            }
        }

        stage('Deploy via Helm') {
            steps {
                sh 'helm upgrade --install your-release ./helm-chart -n backend'
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'kubectl get pods -n backend'
            }
        }
    }

    post {
        always {
            echo '🏁 Pipeline execution completed.'
            sh '''
                echo "=== Final Pod Status ==="
                kubectl get pods -n backend || true
            '''
        }
        success {
            echo '✅ DEPLOYMENT SUCCESSFUL'
        }
        failure {
            echo '❌ DEPLOYMENT FAILED'
        }
    }
}

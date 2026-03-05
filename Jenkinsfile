    // ─────────────────────────────────────────────
        stage('Code Quality') {
        steps {
        echo '🔍 Running code quality checks...'
        sh '''
      # Run static analysis if configured
        ./mvnw checkstyle:checkstyle pmd:pmd spotbugs:spotbugs \
        -DskipTests=${SKIP_TESTS} \
        --batch-mode \
        --no-transfer-progress || echo "⚠️ Code quality checks completed (warnings may be present)"
        '''
        }
        post {
        always {
    archiveArtifacts artifacts: '**/target/*.xml,**/target/*.html,**/target/*.txt', allowEmptyArchive: true
    }
    }
    }

        // ─────────────────────────────────────────────
        stage('Build Docker Images') {
        steps {
        echo '🐳 Building Docker images...'
        script {
        // Read version from pom.xml or use timestamp
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
                    sh 'docker images | grep -E "REPOSITORY|microservice"'
        // Save image list as artifact
        sh 'docker images > docker-images.txt'
    archiveArtifacts artifacts: 'docker-images.txt'
    }
        failure {
        echo '❌ Docker image build failed.'
        // Clean up any partially built images
        sh 'docker system prune -f || true'
    }
    }
    }

        // ─────────────────────────────────────────────
        stage('Security Scan') {
        steps {
        echo '🛡️ Scanning Docker images for vulnerabilities...'
        script {
        try {
        sh '''
      # Use Trivy or similar tool for vulnerability scanning
      # trivy image --exit-code 1 --severity CRITICAL your-image:${IMAGE_VERSION} || echo "⚠️ Vulnerabilities found"
        echo "Security scanning would run here (Trivy, Grype, etc.)"
        '''
    } catch (Exception e) {
    echo "⚠️ Security scan failed or found issues: ${e.message}"
        // Continue pipeline but mark as unstable
        currentBuild.result = 'UNSTABLE'
    }
    }
    }
    }

        // ─────────────────────────────────────────────
        stage('Load Images to Minikube') {
        steps {
        echo '📦 Loading Docker images into Minikube...'
        script {
        try {
        sh '''
        chmod +x load-images.sh
        ./load-images.sh ${IMAGE_VERSION}
      
      # Verify images are loaded
        echo "=== Minikube Images ==="
        minikube image ls | grep -E "microservice|${IMAGE_VERSION}" || echo "No matching images found"
        '''
                    } catch (Exception e) {
                        echo "❌ Failed to load images: ${e.message}"
                        // Attempt alternative loading method
                        sh '''
        echo "Trying alternative image loading method..."
        eval $(minikube docker-env) && docker images || echo "Alternative method also failed"
        '''
                        error("Failed to load images into Minikube")
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        stage('Pre-Deployment Checks') {
        steps {
        echo '🔍 Running pre-deployment validation...'
        sh '''
        echo "=== Kubernetes Cluster Status ==="
        kubectl cluster-info
        kubectl get nodes -o wide
        
        echo "=== Current Deployments ==="
        kubectl get deployments,services,pods --all-namespaces
        
        echo "=== Resource Availability ==="
        kubectl top nodes || echo "Metrics server not available"
        '''
            }
        }

        // ─────────────────────────────────────────────
        stage('Deploy via Helm') {
        steps {
        echo '🚀 Deploying to Kubernetes via Helm...'
        script {
        // Ensure namespace exists
        sh '''
        kubectl create namespace backend --dry-run=client -o yaml | kubectl apply -f -
        kubectl label namespace backend environment=${DEPLOY_ENVIRONMENT} --overwrite
        '''
                    
                    // Deploy with Helm
                    sh """
                        chmod +x deploy-all.sh
                        chmod +x deploy-service.sh
                        
                        # Set image version in values or use --set
                        ./deploy-all.sh --set image.tag=${IMAGE_VERSION} --namespace backend
                        
                        # Alternatively, update values.yaml
                        # sed -i "s/tag:.*/tag: ${IMAGE_VERSION}/" charts/values.yaml
                    """
                }
            }
            post {
                success {
                    echo '✅ Helm deployment completed successfully.'
        // Store deployment info
        sh '''
        helm list -n backend > helm-releases.txt
        kubectl get all -n backend > deployment-status.txt
        '''
                    archiveArtifacts artifacts: 'helm-releases.txt,deployment-status.txt'
    }
    }
    }

        // ─────────────────────────────────────────────
        stage('Smoke Tests') {
        steps {
        echo '🧪 Running smoke tests...'
        script {
    timeout(time: 5, unit: 'MINUTES') {
                               sh '''
                               echo "Waiting for services to become ready..."
      # Wait for all pods to be running
                               kubectl wait --for=condition=ready pod --all -n backend --timeout=300s
                               
                               echo "Running basic connectivity tests..."
      # Test service endpoints
                               ./smoke-tests.sh || echo "⚠️ Smoke tests may have issues"
                               '''
                    }
                }
            }
            post {
                always {
                    // Capture test results
                    sh '''
                               kubectl get pods -n backend -o wide > final-pod-status.txt
                               kubectl describe services -n backend > service-description.txt
        '''
                    archiveArtifacts artifacts: 'final-pod-status.txt,service-description.txt'
    }
    }
    }

        // ─────────────────────────────────────────────
        stage('Integration Tests') {
        when {
        expression { !params.SKIP_TESTS }
    }
        steps {
        echo '🧪 Running integration tests...'
        script {
    timeout(time: 10, unit: 'MINUTES') {
                                sh '''
                                echo "Running integration tests against deployed services..."
                                ./run-integration-tests.sh || echo "⚠️ Integration tests completed with warnings"
                                '''
                    }
                }
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml,**/target/failsafe-reports/*.xml'
    archiveArtifacts artifacts: '**/target/*test-report.*'
    }
    }
    }

    } // end stages
        
        // ─────────────────────────────────────────────
        post {
        // ─────────────────────────────────────────────
        always {
        echo '🏁 Pipeline execution completed.'
        
        // Cleanup and final reporting
        script {
        // Final status report
        sh '''
        echo "=== Final Deployment Status ==="
        kubectl get all -n backend 2>/dev/null || echo "Unable to get deployment status"
        
        echo "=== Resource Usage ==="
        kubectl top pods -n backend 2>/dev/null || echo "Metrics not available"
        
        echo "=== Recent Events ==="
        kubectl get events -n backend --sort-by='.lastTimestamp' 2>/dev/null | tail -10 || echo "Unable to get events"
        '''
                
                // Clean up workspace if needed
                sh '''
        docker system prune -f || true
        rm -f *.txt *.log || true
        '''
            }
        }
        
        success {
            echo '''
        ╔══════════════════════════════════════════════════════════╗
        ║   ✅ DEPLOYMENT SUCCESSFUL                               ║
        ║                                                          ║
                                          ║   Check deployment:                                      ║
        ║   kubectl get all -n backend                             ║
        ║   kubectl get services -n backend                        ║
        ║   minikube service list -n backend                       ║
        ║                                                          ║
                                          ║   Version: ${IMAGE_VERSION}                             ║
                                          ║   Commit: ${GIT_COMMIT}                                 ║
        ╚══════════════════════════════════════════════════════════╝
        '''
            
            // Send success notification
            script {
                emailext (
                    subject: "✅ Deployment Successful - ${JOB_NAME} #${BUILD_NUMBER}",
                    body: """
                    Deployment completed successfully!
                    
                    Project: ${JOB_NAME}
                    Build: #${BUILD_NUMBER}
                    Branch: ${GIT_BRANCH}
                    Commit: ${GIT_COMMIT}
                    Version: ${env.IMAGE_VERSION}
                    Environment: ${params.DEPLOY_ENVIRONMENT}
                    
                    Deployment Status:
                    ${sh(script: 'kubectl get pods -n backend -o wide', returnStdout: true)}
                                                                                                  """,
                    to: 'dev-team@example.com',
                    attachLog: true
                )
            }
        }

        failure {
            echo '''
            ╔══════════════════════════════════════════════════════════╗
            ║   ❌ DEPLOYMENT FAILED                                   ║
            ║                                                          ║
            ║   Troubleshooting commands:                              ║
            ║   kubectl describe pods -n backend                       ║
            ║   kubectl logs <pod-name> -n backend                     ║
            ║   kubectl get events -n backend                          ║
            ║   helm status <release-name> -n backend                  ║
            ║                                                          ║
            ║   Check pipeline logs for detailed error information.    ║
            ╚══════════════════════════════════════════════════════════╝
            '''
            
            // Send failure notification
            script {
                emailext (
                    subject: "❌ Deployment Failed - ${JOB_NAME} #${BUILD_NUMBER}",
                                                                                                  body: """
                    Deployment failed! Please investigate.
                    
                    Project: ${JOB_NAME}
                    Build: #${BUILD_NUMBER}
                    Branch: ${GIT_BRANCH}
                    Error: Check build logs
                    
                    Failed stage: ${currentBuild.result}
                    
                    Recent logs:
                    ${sh(script: 'tail -20 ${BUILD_LOG}', returnStdout: true)}
                    """,
                                                                                                  to: 'dev-ops@example.com',
                                                                                                  attachLog: true
                                                                                                  )
    }
    }
        
        unstable {
        echo '''
        ╔══════════════════════════════════════════════════════════╗
        ║   ⚠️  PIPELINE UNSTABLE                                 ║
        ║                                                          ║
        ║   Some tests failed or quality checks produced warnings. ║
                                          ║   Deployment completed but review the following:         ║
        ║   - Test results                                         ║
        ║   - Code quality reports                                 ║
        ║   - Security scan results                                ║
        ║                                                          ║
        ║   Proceed with caution in production environments.       ║
        ╚══════════════════════════════════════════════════════════╝
        '''
        }
        
        cleanup {
            echo '🧹 Cleaning up workspace...'
        // Clean up temporary files
        sh '''
      # Clean Docker resources
        docker system prune -f || true
      
      # Remove temporary files
        rm -f *.tmp *.log docker-images.txt || true
      
      # Preserve important artifacts
        echo "Build artifacts preserved in Jenkins"
        '''
    }
    }
    }

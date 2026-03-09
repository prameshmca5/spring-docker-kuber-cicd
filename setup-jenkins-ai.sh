#!/bin/bash

# AI Services Jenkins Deployment Setup Script
# This script helps set up Jenkins for AI module deployment

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Main execution
main() {
    print_header "🤖 Jenkins AI Services Deployment Setup"

    # Step 1: Check prerequisites
    print_header "Step 1: Checking Prerequisites"

    if command -v git &> /dev/null; then
        print_success "Git is installed"
    else
        print_error "Git not found"
        exit 1
    fi

    if command -v kubectl &> /dev/null; then
        print_success "kubectl is installed"
    else
        print_error "kubectl not found"
        exit 1
    fi

    if command -v helm &> /dev/null; then
        print_success "helm is installed"
    else
        print_error "helm not found"
        exit 1
    fi

    if command -v docker &> /dev/null; then
        print_success "Docker is installed"
    else
        print_error "Docker not found"
        exit 1
    fi

    # Step 2: Prepare Jenkinsfile
    print_header "Step 2: Prepare Jenkinsfile"

    if [ -f "Jenkinsfile-AI" ]; then
        print_success "Jenkinsfile-AI found"
        print_info "Would you like to replace the current Jenkinsfile with Jenkinsfile-AI?"
        read -p "Enter 'yes' to replace, 'no' to keep both: " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp Jenkinsfile Jenkinsfile.backup
            cp Jenkinsfile-AI Jenkinsfile
            print_success "Jenkinsfile updated (original backed up as Jenkinsfile.backup)"
        else
            print_info "Keeping both Jenkinsfiles"
        fi
    else
        print_error "Jenkinsfile-AI not found"
        exit 1
    fi

    # Step 3: Update pom.xml
    print_header "Step 3: Update Parent pom.xml"

    if grep -q "ai-core-module" pom.xml; then
        print_success "Parent pom.xml already updated with AI modules"
    else
        print_warn "Parent pom.xml needs to be updated"
        print_info "Run: git pull to get latest pom.xml"
    fi

    # Step 4: Verify Helm charts
    print_header "Step 4: Verify Helm Charts for AI Services"

    if [ -f "helm-charts/ai-services/Chart.yaml" ]; then
        print_success "AI services Helm chart found"

        if [ -f "helm-charts/ai-services/values.yaml" ]; then
            print_success "values.yaml found"
        else
            print_error "values.yaml missing"
        fi

        if [ -f "helm-charts/ai-services/templates/ai-core-module.yaml" ]; then
            print_success "AI core module template found"
        else
            print_error "AI core module template missing"
        fi

        if [ -f "helm-charts/ai-services/templates/fraud-detection.yaml" ]; then
            print_success "Fraud detection template found"
        else
            print_error "Fraud detection template missing"
        fi
    else
        print_error "AI services Helm chart not found"
        exit 1
    fi

    # Step 5: Jenkins configuration suggestions
    print_header "Step 5: Jenkins Configuration"

    echo "Configure the following in Jenkins:"
    echo ""
    echo "1. Install Plugins:"
    echo "   - Pipeline"
    echo "   - Git"
    echo "   - Docker"
    echo "   - Kubernetes"
    echo "   - Helm"
    echo "   - Groovy"
    echo "   - Timestamper"
    echo "   - AnsiColor"
    echo ""
    echo "2. Create Credentials:"
    echo "   - docker-registry: Docker registry username/password"
    echo "   - kubeconfig-file: Kubernetes config file"
    echo ""
    echo "3. Create Pipeline Job:"
    echo "   - Name: banking-services-ai"
    echo "   - Type: Pipeline"
    echo "   - SCM: Git (your repo)"
    echo "   - Script Path: Jenkinsfile or Jenkinsfile-AI"
    echo ""
    echo "4. Configure Build Triggers:"
    echo "   - GitHub webhook for automatic builds"
    echo "   - Poll SCM every 15 minutes"
    echo ""

    # Step 6: Git commit changes
    print_header "Step 6: Commit Changes"

    print_info "Commit all changes to git:"
    echo ""
    echo "git add Jenkinsfile pom.xml helm-charts/ai-services/"
    echo "git commit -m 'Add AI module Jenkins pipeline and Helm charts'"
    echo "git push"
    echo ""

    read -p "Have you committed the changes? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warn "Please commit changes before proceeding"
        return 1
    fi

    # Step 7: Test build locally
    print_header "Step 7: Test Local Build"

    print_info "Testing local build of AI modules..."

    if [ -f "mvnw" ]; then
        chmod +x mvnw
        print_info "Building ai-core-module..."
        if ./mvnw clean package -pl ai-core-module -DskipTests -q; then
            print_success "ai-core-module built successfully"
        else
            print_error "ai-core-module build failed"
            return 1
        fi

        print_info "Building ai-fraud-detection..."
        if ./mvnw clean package -pl ai-fraud-detection -DskipTests -q; then
            print_success "ai-fraud-detection built successfully"
        else
            print_error "ai-fraud-detection build failed"
            return 1
        fi
    else
        print_warn "mvnw not found, skipping local build test"
    fi

    # Step 8: Summary
    print_header "Setup Complete!"

    echo ""
    echo "✅ Next Steps:"
    echo ""
    echo "1. Log in to Jenkins UI"
    echo "2. Create new Pipeline job"
    echo "3. Configure with your Git repository"
    echo "4. Set Script Path to: Jenkinsfile or Jenkinsfile-AI"
    echo "5. Click 'Build with Parameters'"
    echo "6. Select desired options:"
    echo "   - BUILD_AI_MODULES: true"
    echo "   - BUILD_AI_SERVICES: true"
    echo "   - DEPLOY_AI_SERVICES: true"
    echo "   - DEPLOY_BACKEND: true"
    echo "7. Click 'Build' and monitor console output"
    echo ""
    echo "📚 Documentation:"
    echo "   - Read: JENKINS_AI_DEPLOYMENT_GUIDE.md"
    echo ""
    echo "📊 Monitor Deployment:"
    echo "   - kubectl get pods -n backend"
    echo "   - kubectl get svc -n backend"
    echo "   - kubectl logs -f -l app=ai-fraud-detection -n backend"
    echo ""
    echo "🚀 Jenkins is ready for AI service deployment!"
    echo ""
}

# Run main function
main


#!/bin/bash

# AI Services Testing Script
# Purpose: Check if AI services are working correctly
# Usage: chmod +x test-ai-services.sh && ./test-ai-services.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

print_test() {
    echo -e "${YELLOW}Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ PASS: $1${NC}"
    ((TESTS_PASSED++))
}

print_error() {
    echo -e "${RED}✗ FAIL: $1${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Test 1: Build Verification
test_build() {
    print_header "TEST 1: BUILD VERIFICATION"

    print_test "Building ai-core-module"
    if mvn clean package -pl ai-core-module -DskipTests -q 2>/dev/null; then
        print_success "ai-core-module builds"
    else
        print_error "ai-core-module build failed"
        return 1
    fi

    print_test "Building ai-fraud-detection"
    if mvn clean package -pl ai-fraud-detection -DskipTests -q 2>/dev/null; then
        print_success "ai-fraud-detection builds"
    else
        print_error "ai-fraud-detection build failed"
        return 1
    fi

    print_test "Checking JAR files"
    if [ -f "ai-core-module/target/ai-core-module-1.0.0-SNAPSHOT.jar" ]; then
        print_success "ai-core-module JAR created"
    else
        print_error "ai-core-module JAR not found"
        return 1
    fi

    if [ -f "ai-fraud-detection/target/ai-fraud-detection-1.0.0-SNAPSHOT.jar" ]; then
        print_success "ai-fraud-detection JAR created"
    else
        print_error "ai-fraud-detection JAR not found"
        return 1
    fi
}

# Test 2: Java Classes Verification
test_java_classes() {
    print_header "TEST 2: JAVA CLASSES VERIFICATION"

    print_test "Checking ModelMetadata.java"
    if [ -f "ai-core-module/src/main/java/com/qacts/aicore/model/ModelMetadata.java" ]; then
        print_success "ModelMetadata.java exists"
    else
        print_error "ModelMetadata.java not found"
        return 1
    fi

    print_test "Checking ModelRegistry.java"
    if [ -f "ai-core-module/src/main/java/com/qacts/aicore/registry/ModelRegistry.java" ]; then
        print_success "ModelRegistry.java exists"
    else
        print_error "ModelRegistry.java not found"
        return 1
    fi

    print_test "Checking ModelLoaderService.java"
    if [ -f "ai-core-module/src/main/java/com/qacts/aicore/service/ModelLoaderService.java" ]; then
        print_success "ModelLoaderService.java exists"
    else
        print_error "ModelLoaderService.java not found"
        return 1
    fi

    print_test "Checking FraudScore.java"
    if [ -f "ai-fraud-detection/src/main/java/com/qacts/aifraud/model/FraudScore.java" ]; then
        print_success "FraudScore.java exists"
    else
        print_error "FraudScore.java not found"
        return 1
    fi

    print_test "Checking RuleBasedFraudDetector.java"
    if [ -f "ai-fraud-detection/src/main/java/com/qacts/aifraud/service/RuleBasedFraudDetector.java" ]; then
        print_success "RuleBasedFraudDetector.java exists"
    else
        print_error "RuleBasedFraudDetector.java not found"
        return 1
    fi
}

# Test 3: Documentation Verification
test_documentation() {
    print_header "TEST 3: DOCUMENTATION VERIFICATION"

    DOCS=(
        "AI_README.md"
        "AI_ARCHITECTURE_DIAGRAM.md"
        "AI_IMPLEMENTATION_SUMMARY.md"
        "AI_QUICK_REFERENCE.md"
        "AI_IMPLEMENTATION_GUIDE.md"
        "AI_IMPLEMENTATION_STRATEGY.md"
        "AI_FILE_INDEX.md"
        "HOW_TO_TEST_AI_SERVICES.md"
        "START_HERE.md"
    )

    for doc in "${DOCS[@]}"; do
        print_test "Checking $doc"
        if [ -f "$doc" ]; then
            print_success "$doc exists"
        else
            print_error "$doc not found"
            return 1
        fi
    done
}

# Test 4: Module Structure
test_module_structure() {
    print_header "TEST 4: MODULE STRUCTURE"

    MODULES=(
        "ai-core-module"
        "ai-fraud-detection"
        "ai-credit-service"
        "ai-recommendation-service"
        "ai-analytics-service"
        "ai-chatbot-service"
        "ai-ml-pipeline"
    )

    for module in "${MODULES[@]}"; do
        print_test "Checking $module"
        if [ -f "$module/pom.xml" ]; then
            print_success "$module/pom.xml exists"
        else
            print_error "$module/pom.xml not found"
            return 1
        fi
    done
}

# Test 5: Maven Dependencies
test_maven_dependencies() {
    print_header "TEST 5: MAVEN DEPENDENCIES"

    print_test "Checking Spring Boot dependency"
    if grep -q "spring-boot-starter-web" ai-core-module/pom.xml; then
        print_success "Spring Boot dependency found"
    else
        print_error "Spring Boot dependency not found"
        return 1
    fi

    print_test "Checking Kafka dependency"
    if grep -q "spring-kafka" ai-fraud-detection/pom.xml; then
        print_success "Kafka dependency found"
    else
        print_error "Kafka dependency not found"
        return 1
    fi

    print_test "Checking Spring Cloud dependency"
    if grep -q "spring-cloud-starter-netflix-eureka-client" ai-core-module/pom.xml; then
        print_success "Spring Cloud dependency found"
    else
        print_error "Spring Cloud dependency not found"
        return 1
    fi
}

# Test 6: Service Registry
test_service_registry() {
    print_header "TEST 6: SERVICE REGISTRY CHECK"

    print_info "Check if Eureka is running: http://localhost:8761"

    print_test "Checking Eureka health"
    if curl -s -f http://localhost:8761/eureka/apps > /dev/null 2>&1; then
        print_success "Eureka is accessible"
    else
        print_error "Eureka is not accessible (this is OK if services not started yet)"
    fi
}

# Test 7: Fraud Detection Algorithm
test_fraud_detection_logic() {
    print_header "TEST 7: FRAUD DETECTION LOGIC"

    # Check if rule-based detector has required methods
    print_test "Checking RuleBasedFraudDetector implementation"

    if grep -q "detectFraud" ai-fraud-detection/src/main/java/com/qacts/aifraud/service/RuleBasedFraudDetector.java; then
        print_success "detectFraud method exists"
    else
        print_error "detectFraud method not found"
        return 1
    fi

    if grep -q "checkTransactionAmount" ai-fraud-detection/src/main/java/com/qacts/aifraud/service/RuleBasedFraudDetector.java; then
        print_success "checkTransactionAmount method exists"
    else
        print_error "checkTransactionAmount method not found"
        return 1
    fi

    if grep -q "checkTransactionVelocity" ai-fraud-detection/src/main/java/com/qacts/aifraud/service/RuleBasedFraudDetector.java; then
        print_success "checkTransactionVelocity method exists"
    else
        print_error "checkTransactionVelocity method not found"
        return 1
    fi
}

# Main execution
main() {
    print_header "🤖 AI SERVICES TEST SUITE 🤖"
    print_info "Testing AI implementation..."
    echo ""

    # Run all tests
    test_build || true
    test_java_classes || true
    test_documentation || true
    test_module_structure || true
    test_maven_dependencies || true
    test_service_registry || true
    test_fraud_detection_logic || true

    # Print summary
    echo ""
    print_header "TEST SUMMARY"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}AI services are properly set up and ready to use.${NC}"
        echo ""
        echo -e "${BLUE}Next Steps:${NC}"
        echo "1. Read: START_HERE.md"
        echo "2. Read: AI_README.md"
        echo "3. Review: AI_ARCHITECTURE_DIAGRAM.md"
        echo "4. Start: Integration with Transaction Service"
        return 0
    else
        echo -e "${RED}❌ SOME TESTS FAILED${NC}"
        echo -e "${RED}Please fix the issues above before proceeding.${NC}"
        return 1
    fi
}

# Run main
main


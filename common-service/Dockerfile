# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — BUILD
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /workspace

# Copy the Maven wrapper and parent POM from one level up
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Copy all necessary modules for the build context
COPY employee-service/ ./employee-service/
COPY discovery-server/ ./discovery-server/
COPY api-gateway/ ./api-gateway/
COPY account-service/ ./account-service/
COPY customer-service/ ./customer-service/
COPY transaction-service/ ./transaction-service/
COPY notification-service/ ./notification-service/
COPY payment-service/ ./payment-service/
COPY common-service/ ./common-service/

# Build the common-service
RUN chmod +x mvnw && ./mvnw clean package -pl common-service -am -DskipTests -B

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — RUNTIME
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy AS runtime

# Create a non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy the fat JAR
COPY --from=builder /workspace/common-service/target/*.jar app.jar

# Ownership
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8087

# JVM tuning
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]

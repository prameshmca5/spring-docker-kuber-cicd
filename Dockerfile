# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — BUILD
# Uses the full JDK + Maven to compile the multi-module project
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-jammy AS builder

# Which module to build
ARG MODULE_NAME
ENV MODULE_NAME=${MODULE_NAME}

WORKDIR /workspace

# Copy the Maven wrapper and parent POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Copy all the module folders (this ensures the entire reactor is present for dependency resolution)
COPY employee-service/ ./employee-service/
COPY discovery-server/ ./discovery-server/
COPY api-gateway/ ./api-gateway/
COPY account-service/ ./account-service/
COPY customer-service/ ./customer-service/
COPY transaction-service/ ./transaction-service/
COPY notification-service/ ./notification-service/
COPY payment-service/ ./payment-service/
COPY common-service/ ./common-service/
COPY auth-service/ ./auth-service/

# Build just the specific module along with its reactor dependencies
RUN chmod +x mvnw && ./mvnw clean package -pl ${MODULE_NAME} -am -DskipTests -B

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — RUNTIME
# Uses a slim JRE-only image — no compiler, no Maven, minimal attack surface.
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy AS runtime

ARG MODULE_NAME
ENV MODULE_NAME=${MODULE_NAME}

# Create a non-root user for security best practice
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy only the fat JAR from the builder stage
COPY --from=builder /workspace/${MODULE_NAME}/target/*.jar app.jar

# Give ownership to the non-root user
RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080 8081 8082 8083 8084 8085 8761

# JVM tuning for containerized environments
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]

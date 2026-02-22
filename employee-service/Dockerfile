# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — BUILD
# Uses the full JDK + Maven to compile the project and produce the fat JAR.
# eclipse-temurin:17-jdk-jammy has multi-arch support (amd64 + arm64/Apple Silicon)
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /workspace

# Copy Maven wrapper and pom.xml first — lets Docker cache the dependency layer
# so dependencies are NOT re-downloaded on every source-code change.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy application source and build (skip tests — they run in CI, not here)
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — RUNTIME
# Uses a slim JRE-only image — no compiler, no Maven, minimal attack surface.
# eclipse-temurin:17-jre-jammy supports amd64 + arm64 (Apple Silicon)
# ─────────────────────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy AS runtime

# Create a non-root user for security best practice
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy only the fat JAR from the build stage
COPY --from=builder /workspace/target/*.jar app.jar

# Give ownership to the non-root user
RUN chown appuser:appgroup app.jar

USER appuser

# Expose the application port (matches SERVER_PORT env var / application.yml default)
EXPOSE 8081

# JVM tuning for containerized environments:
#   -XX:+UseContainerSupport        → respect Docker CPU/memory limits
#   -XX:MaxRAMPercentage=75.0       → use up to 75% of container RAM for heap
#   -Djava.security.egd=...         → faster SecureRandom start-up
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]

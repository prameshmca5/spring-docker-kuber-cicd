FROM eclipse-temurin:17-jre-jammy

ARG MODULE_NAME
ENV MODULE_NAME=${MODULE_NAME}

# Create a non-root user for security best practice
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# The jars are already pre-compiled by the Jenkins host / wrapper scripts
# We skip the redundant multi-stage build to save 15+ minutes!
COPY ${MODULE_NAME}/target/*.jar app.jar

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

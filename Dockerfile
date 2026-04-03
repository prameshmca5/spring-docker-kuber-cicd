FROM curlimages/curl:8.13.0 AS elastic-apm-agent

ARG ELASTIC_APM_AGENT_VERSION=1.55.4

RUN curl -fsSL --retry 5 \
    --output /tmp/elastic-apm-agent.jar \
    "https://repo1.maven.org/maven2/co/elastic/apm/elastic-apm-agent/${ELASTIC_APM_AGENT_VERSION}/elastic-apm-agent-${ELASTIC_APM_AGENT_VERSION}.jar"

FROM eclipse-temurin:17-jre-jammy

ARG MODULE_NAME
ENV MODULE_NAME=${MODULE_NAME} \
    ELASTIC_APM_ENABLED=false \
    JAVA_MAX_RAM_PERCENTAGE=75.0

# Create a non-root user for security best practice
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# The jars are already pre-compiled by the Jenkins host / wrapper scripts
# We skip the redundant multi-stage build to save 15+ minutes!
COPY ${MODULE_NAME}/target/*.jar app.jar
RUN mkdir -p /opt/elastic/apm
COPY --from=elastic-apm-agent /tmp/elastic-apm-agent.jar /opt/elastic/apm/elastic-apm-agent.jar
COPY docker/entrypoint.sh /entrypoint.sh

# Give ownership to the non-root user
RUN chmod 755 /entrypoint.sh && \
    chown -R appuser:appgroup /app /opt/elastic/apm /entrypoint.sh

USER appuser

EXPOSE 8080 8081 8082 8083 8084 8085 8086 8087 8761

ENTRYPOINT ["/entrypoint.sh"]

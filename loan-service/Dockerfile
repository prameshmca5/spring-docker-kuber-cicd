FROM curlimages/curl:8.13.0 AS elastic-apm-agent

ARG ELASTIC_APM_AGENT_VERSION=1.55.4

RUN curl -fsSL --retry 5 \
    --output /elastic-apm-agent.jar \
    "https://repo1.maven.org/maven2/co/elastic/apm/elastic-apm-agent/${ELASTIC_APM_AGENT_VERSION}/elastic-apm-agent-${ELASTIC_APM_AGENT_VERSION}.jar"

FROM eclipse-temurin:17-jre-jammy

ENV ELASTIC_APM_ENABLED=false \
    JAVA_MAX_RAM_PERCENTAGE=75.0

WORKDIR /app
COPY target/*.jar app.jar
RUN mkdir -p /opt/elastic/apm
COPY --from=elastic-apm-agent /elastic-apm-agent.jar /opt/elastic/apm/elastic-apm-agent.jar
EXPOSE 8087
ENTRYPOINT ["sh", "-c", "if [ \"${ELASTIC_APM_ENABLED:-false}\" = \"true\" ]; then exec java ${JAVA_OPTS:-} -XX:+UseContainerSupport -XX:MaxRAMPercentage=${JAVA_MAX_RAM_PERCENTAGE:-75.0} -Djava.security.egd=file:/dev/./urandom -javaagent:/opt/elastic/apm/elastic-apm-agent.jar -jar app.jar; else exec java ${JAVA_OPTS:-} -XX:+UseContainerSupport -XX:MaxRAMPercentage=${JAVA_MAX_RAM_PERCENTAGE:-75.0} -Djava.security.egd=file:/dev/./urandom -jar app.jar; fi"]

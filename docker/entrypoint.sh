#!/bin/sh
set -eu
set -f

set -- java

if [ -n "${JAVA_OPTS:-}" ]; then
  # Allow space-delimited JVM flags while keeping pathname expansion disabled.
  set -- "$@" $JAVA_OPTS
fi

set -- "$@" \
  "-XX:+UseContainerSupport" \
  "-XX:MaxRAMPercentage=${JAVA_MAX_RAM_PERCENTAGE:-75.0}" \
  "-Djava.security.egd=file:/dev/./urandom"

if [ "${ELASTIC_APM_ENABLED:-false}" = "true" ] && [ -f /opt/elastic/apm/elastic-apm-agent.jar ]; then
  set -- "$@" "-javaagent:/opt/elastic/apm/elastic-apm-agent.jar"
fi

set -- "$@" "-jar" "/app/app.jar"

exec "$@"

FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the pre-built jar from the local target directory
COPY target/api-gateway-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

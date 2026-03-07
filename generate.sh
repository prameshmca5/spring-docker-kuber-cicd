#!/bin/bash
set -e

SERVICES=(
  "account-service:mysql"
  "customer-service:postgresql"
  "transaction-service:mysql"
  "notification-service:h2"
  "payment-service:mysql"
)

PARENT_DIR="/Users/rohit/JavaApplication/springbootapps"
cd $PARENT_DIR

for item in "${SERVICES[@]}"; do
  IFS=':' read -r SERVICE_NAME DB_TYPE <<< "$item"
  PACKAGE_NAME=$(echo "$SERVICE_NAME" | tr -d '-')
  CLASS_NAME=$(echo "$SERVICE_NAME" | awk -F- '{print toupper(substr($1,1,1)) substr($1,2) toupper(substr($2,1,1)) substr($2,2)}')Application

  echo "Creating $SERVICE_NAME..."
  
  # 1. Create Directories
  mkdir -p $SERVICE_NAME/src/main/java/com/qacts/$PACKAGE_NAME
  mkdir -p $SERVICE_NAME/src/main/resources

  # 2. Add Module to Parent POM
  if ! grep -q "<module>$SERVICE_NAME</module>" pom.xml; then
    sed -i '' "/<\/modules>/i \\
        <module>$SERVICE_NAME</module>\\
" pom.xml
  fi

  # 3. Create POM File
  cat <<EOF > $SERVICE_NAME/pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.qacts</groupId>
        <artifactId>banking-microservices</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>$SERVICE_NAME</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>$SERVICE_NAME</name>
    <description>$SERVICE_NAME</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
EOF

  if [ "$DB_TYPE" == "mysql" ]; then
    cat <<EOF >> $SERVICE_NAME/pom.xml
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
EOF
  elif [ "$DB_TYPE" == "postgresql" ]; then
    cat <<EOF >> $SERVICE_NAME/pom.xml
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
EOF
  elif [ "$DB_TYPE" == "h2" ]; then
    cat <<EOF >> $SERVICE_NAME/pom.xml
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
EOF
  fi

  cat <<EOF >> $SERVICE_NAME/pom.xml
    </dependencies>
</project>
EOF

  # 4. Create Main App Class
  cat <<EOF > $SERVICE_NAME/src/main/java/com/qacts/$PACKAGE_NAME/$CLASS_NAME.java
package com.qacts.$PACKAGE_NAME;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class $CLASS_NAME {
    public static void main(String[] args) {
        SpringApplication.run($CLASS_NAME.class, args);
    }
}
EOF

  # 5. Create application.yml
  PORT=""
  if [ "$SERVICE_NAME" == "account-service" ]; then PORT=8081; fi
  if [ "$SERVICE_NAME" == "customer-service" ]; then PORT=8082; fi
  if [ "$SERVICE_NAME" == "transaction-service" ]; then PORT=8083; fi
  if [ "$SERVICE_NAME" == "notification-service" ]; then PORT=8084; fi
  if [ "$SERVICE_NAME" == "payment-service" ]; then PORT=8085; fi

  cat <<EOF > $SERVICE_NAME/src/main/resources/application.yml
server:
  port: $PORT

spring:
  application:
    name: $SERVICE_NAME
EOF

  if [ "$DB_TYPE" == "mysql" ]; then
    cat <<EOF >> $SERVICE_NAME/src/main/resources/application.yml
  datasource:
    url: jdbc:mysql://\${DB_HOST:localhost}:3306/\${DB_NAME:db}
    username: \${DB_USERNAME:root}
    password: \${DB_PASSWORD:root}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
EOF
  elif [ "$DB_TYPE" == "postgresql" ]; then
    cat <<EOF >> $SERVICE_NAME/src/main/resources/application.yml
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/\${DB_NAME:db}
    username: \${DB_USERNAME:postgres}
    password: \${DB_PASSWORD:password}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
EOF
  elif [ "$DB_TYPE" == "h2" ]; then
    cat <<EOF >> $SERVICE_NAME/src/main/resources/application.yml
  datasource:
    url: jdbc:h2:mem:\${DB_NAME:db}
    driverClassName: org.h2.Driver
    username: sa
    password: password
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: update
  h2:
    console:
      enabled: true
EOF
  fi

  cat <<EOF >> $SERVICE_NAME/src/main/resources/application.yml

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
EOF

done

echo "All services completely generated."

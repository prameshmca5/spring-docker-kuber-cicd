package com.example.discoveryserver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServerApplication {

    private static final Logger log = LoggerFactory.getLogger(DiscoveryServerApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
        log.info("Discovery Server (Eureka) started successfully on port 8761");
    }
}

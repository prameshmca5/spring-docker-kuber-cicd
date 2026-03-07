package com.qacts.customerservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CustomerServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(CustomerServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CustomerServiceApplication.class, args);
        log.info("Customer Service started successfully");
    }
}

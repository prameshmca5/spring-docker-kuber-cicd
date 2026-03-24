package com.qacts.cardservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CardServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(CardServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CardServiceApplication.class, args);
        log.info("Card Service started successfully");
    }
}

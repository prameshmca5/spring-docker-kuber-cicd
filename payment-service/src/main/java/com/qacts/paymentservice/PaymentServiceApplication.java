package com.qacts.paymentservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class PaymentServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
        log.info("Payment Service started successfully");
    }
}

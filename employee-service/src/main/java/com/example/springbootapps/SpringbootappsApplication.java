package com.example.springbootapps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class SpringbootappsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootappsApplication.class, args);
    }

}

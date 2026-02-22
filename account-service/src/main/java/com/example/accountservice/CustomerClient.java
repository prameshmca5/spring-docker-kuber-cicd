package com.example.accountservice;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "customer-service", url = "${customer.service.url:http://localhost:8081}")
public interface CustomerClient {
    @GetMapping("/api/v1/customers/{id}")
    Object getCustomerById(@PathVariable("id") Long id);
}

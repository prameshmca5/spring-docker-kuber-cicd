package com.example.transactionservice;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "account-service", url = "${account.service.url:http://localhost:8082}")
public interface AccountClient {

    @GetMapping("/api/v1/accounts/{id}")
    Map<String, Object> getAccountById(@PathVariable("id") Long id);

    @PutMapping("/api/v1/accounts/{id}")
    void updateAccount(@PathVariable("id") Long id, @RequestBody Map<String, Object> account);
}

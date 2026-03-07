package com.qacts.paymentservice;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "account-service")
public interface AccountClient {

    @GetMapping("/api/v1/accounts/{id}")
    // Since an account isn't indexed by its ID in the account-service controller
    // right now (we only have getAll and getByCustomerId),
    // and payment-service's incoming POST request contains `accountId`, we actually
    // need a `GET /api/v1/accounts/{id}` endpoint in account-service!
    // But wait, we can just add that endpoint to account-service first!
    AccountDto getAccountById(@PathVariable("id") Long id);
}

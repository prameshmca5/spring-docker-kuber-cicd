package com.example.accountservice;

import org.springframework.web.bind.annotation.*;
import org.springframework.kafka.core.KafkaTemplate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private static final String TOPIC = "account.created";

    private final AccountRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public AccountController(AccountRepository repository,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @GetMapping
    public List<Account> getAll() {
        return repository.findAll();
    }

    @GetMapping("/customer/{customerId}")
    public List<Account> getByCustomerId(@PathVariable Long customerId) {
        return repository.findByCustomerId(customerId);
    }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<Account> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(org.springframework.http.ResponseEntity::ok)
                .orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @PostMapping
    public Account create(@RequestBody Account acc) {
        Account saved = repository.save(acc);

        // Publish async notification event
        NotificationEvent event = new NotificationEvent(
                saved.getCustomerId(),
                "ACCOUNT_CREATED",
                null,
                Map.of(
                        "accountId", String.valueOf(saved.getId()),
                        "balance", String.format("%.2f", saved.getBalance())));
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), event);

        return saved;
    }
}

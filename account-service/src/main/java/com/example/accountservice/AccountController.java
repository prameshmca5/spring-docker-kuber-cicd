package com.example.accountservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    private static final Logger log = LoggerFactory.getLogger(AccountController.class);
    private static final String TOPIC = "account.created";

    private final AccountRepository repository;
    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    private final CustomerClient customerClient;

    public AccountController(AccountRepository repository,
            KafkaTemplate<String, NotificationEvent> kafkaTemplate,
            CustomerClient customerClient) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
        this.customerClient = customerClient;
        log.info("AccountController initialized");
    }

    @GetMapping
    public ResponseEntity<List<Account>> getAll() {
        log.info("GET /api/v1/accounts - Fetching all accounts");
        List<Account> accounts = repository.findAll();
        log.debug("Found {} accounts", accounts.size());
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getById(@PathVariable Long id) {
        log.info("GET /api/v1/accounts/{} - Fetching account by ID", id);
        return repository.findById(id)
                .map(acc -> {
                    log.debug("Account found with ID: {}", id);
                    return ResponseEntity.ok(acc);
                })
                .orElseGet(() -> {
                    log.warn("Account not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<Account> create(@RequestBody Account acc) {
        log.info("POST /api/v1/accounts - Creating new account for customer ID: {}", acc.getCustomerId());

        // Verify customer exists via FeignClient
        try {
            Object customer = customerClient.getCustomerById(acc.getCustomerId());
            if (customer == null) {
                log.warn("Customer not found with ID: {}", acc.getCustomerId());
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            log.error("Error verifying customer existence or customer not found for ID: {}. Error: {}",
                    acc.getCustomerId(), e.getMessage());
            return ResponseEntity.badRequest().build();
        }

        Account saved = repository.save(acc);
        log.info("Account created with ID: {}", saved.getId());

        // Publish async notification event to Kafka
        NotificationEvent event = new NotificationEvent(
                saved.getCustomerId(),
                "ACCOUNT_CREATED",
                String.format("New %s account created with balance %.2f",
                        saved.getAccountType(), saved.getBalance()));
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), event);
        log.info("Published ACCOUNT_CREATED event to topic '{}' for customerId={}", TOPIC, saved.getCustomerId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> update(@PathVariable Long id, @RequestBody Account updated) {
        log.info("PUT /api/v1/accounts/{} - Updating account", id);
        return repository.findById(id)
                .map(existing -> {
                    updated.setId(id);
                    Account saved = repository.save(updated);
                    log.info("Account updated with ID: {}", id);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> {
                    log.warn("Account not found for update with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/v1/accounts/{} - Deleting account", id);
        if (!repository.existsById(id)) {
            log.warn("Account not found for deletion with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        log.info("Account deleted with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}

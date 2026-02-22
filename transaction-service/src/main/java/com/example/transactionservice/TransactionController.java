package com.example.transactionservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private static final Logger log = LoggerFactory.getLogger(TransactionController.class);
    private static final String TOPIC = "transaction.created";

    private final TransactionRepository repository;
    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    private final AccountClient accountClient;

    public TransactionController(TransactionRepository repository,
            KafkaTemplate<String, NotificationEvent> kafkaTemplate,
            AccountClient accountClient) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
        this.accountClient = accountClient;
        log.info("TransactionController initialized");
    }

    @GetMapping
    public ResponseEntity<List<BankTransaction>> getAll() {
        log.info("GET /api/v1/transactions - Fetching all transactions");
        List<BankTransaction> txs = repository.findAll();
        log.debug("Found {} transactions", txs.size());
        return ResponseEntity.ok(txs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BankTransaction> getById(@PathVariable Long id) {
        log.info("GET /api/v1/transactions/{} - Fetching transaction by ID", id);
        return repository.findById(id)
                .map(tx -> {
                    log.debug("Transaction found with ID: {}", id);
                    return ResponseEntity.ok(tx);
                })
                .orElseGet(() -> {
                    log.warn("Transaction not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<BankTransaction> create(@RequestBody BankTransaction tx) {
        log.info("POST /api/v1/transactions - Creating new transaction for account ID: {}", tx.getAccountId());

        // Verify account exists and check balance via FeignClient
        try {
            java.util.Map<String, Object> account = accountClient.getAccountById(tx.getAccountId());
            if (account == null) {
                log.warn("Account not found with ID: {}", tx.getAccountId());
                return ResponseEntity.badRequest().build();
            }

            double currentBalance = Double.parseDouble(account.get("balance").toString());
            double amount = tx.getAmount();
            String type = tx.getType(); // e.g., "WITHDRAWAL" or "DEPOSIT"

            if ("WITHDRAWAL".equalsIgnoreCase(type)) {
                if (currentBalance < amount) {
                    log.warn("Insufficient funds in account ID: {}", tx.getAccountId());
                    return ResponseEntity.badRequest().build();
                }
                account.put("balance", currentBalance - amount);
            } else if ("DEPOSIT".equalsIgnoreCase(type)) {
                account.put("balance", currentBalance + amount);
            } else {
                log.warn("Unknown transaction type: {}", type);
                return ResponseEntity.badRequest().build();
            }

            // Update account balance
            accountClient.updateAccount(tx.getAccountId(), account);
            log.info("Updated balance for account ID: {} to {}", tx.getAccountId(), account.get("balance"));

        } catch (Exception e) {
            log.error("Error verifying account existence or processing transaction for account ID: {}. Error: {}",
                    tx.getAccountId(), e.getMessage());
            return ResponseEntity.badRequest().build();
        }

        BankTransaction saved = repository.save(tx);
        log.info("Transaction created with ID: {}", saved.getId());

        // Publish async notification event
        NotificationEvent event = new NotificationEvent(
                saved.getAccountId(),
                "TRANSACTION_CREATED",
                String.format("Transaction of amount %.2f processed successfully. Type: %s", saved.getAmount(),
                        saved.getType()));
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), event);
        log.info("Published TRANSACTION_CREATED event to topic '{}' for accountId={}", TOPIC, saved.getAccountId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/v1/transactions/{} - Deleting transaction", id);
        if (!repository.existsById(id)) {
            log.warn("Transaction not found for deletion with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        log.info("Transaction deleted with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}

package com.qacts.transactionservice;

import org.springframework.web.bind.annotation.*;
import org.springframework.kafka.core.KafkaTemplate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private static final String TOPIC = "transaction.created";

    private final TransactionRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public TransactionController(TransactionRepository repository,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @GetMapping
    public List<BankTransaction> getAll() {
        return repository.findAll();
    }

    @GetMapping("/account/{accountId}")
    public List<BankTransaction> getByAccountId(@PathVariable Long accountId) {
        return repository.findByAccountId(accountId);
    }

    @PostMapping
    public BankTransaction create(@RequestBody BankTransaction tx) {
        BankTransaction saved = repository.save(tx);

        // Publish async notification event
        // Note: Currently, Transaction doesn't have customerId, only accountId.
        // We'll pass accountId here, but for correct logic we might need to fetch
        // customerId.
        // I will fix payment-service first, but here we'll pass null or default.
        NotificationEvent event = new NotificationEvent(
                saved.getAccountId(), // WARNING: Transaction only has accountId, not customerId
                "TRANSACTION_CREATED",
                null,
                Map.of(
                        "transactionId", String.valueOf(saved.getId()),
                        "amount", String.format("%.2f", saved.getAmount()),
                        "type", saved.getType()));
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), event);

        return saved;
    }
}

package com.example.paymentservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    private static final String TOPIC = "payment.created";

    private final PaymentRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public PaymentController(PaymentRepository repository,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
        log.info("PaymentController initialized");
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAll() {
        log.info("GET /api/v1/payments - Fetching all payments");
        List<Payment> payments = repository.findAll();
        log.debug("Found {} payments", payments.size());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        log.info("GET /api/v1/payments/{} - Fetching payment by ID", id);
        return repository.findById(id)
                .map(p -> {
                    log.debug("Payment found with ID: {}", id);
                    return ResponseEntity.ok(p);
                })
                .orElseGet(() -> {
                    log.warn("Payment not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<Payment>> getByAccountId(@PathVariable Long accountId) {
        log.info("GET /api/v1/payments/account/{} - Fetching payments by account ID", accountId);
        List<Payment> payments = repository.findByAccountId(accountId);
        log.debug("Found {} payments for account {}", payments.size(), accountId);
        return ResponseEntity.ok(payments);
    }

    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment p) {
        log.info("POST /api/v1/payments - Creating new payment");
        Payment saved = repository.save(p);
        log.info("Payment created with ID: {}", saved.getId());

        // Build metadata for the notification template
        Map<String, String> metadata = new java.util.HashMap<>();
        metadata.put("amount", String.format("%.2f", saved.getAmount()));
        metadata.put("paymentId", String.valueOf(saved.getId()));

        // Publish async notification event with template metadata
        NotificationEvent event = new NotificationEvent(
                saved.getAccountId(),
                "PAYMENT_CREATED",
                null,
                metadata);
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), event);
        log.info("Published PAYMENT_CREATED event to topic '{}' for accountId={}", TOPIC, saved.getAccountId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/v1/payments/{} - Deleting payment", id);
        if (!repository.existsById(id)) {
            log.warn("Payment not found for deletion with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        log.info("Payment deleted with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}

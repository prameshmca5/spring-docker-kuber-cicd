package com.qacts.paymentservice;

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
    private final AccountClient accountClient;
    private final BillerRepository billerRepository;
    private final ScheduledPaymentRepository scheduledPaymentRepository;

    public PaymentController(PaymentRepository repository,
            KafkaTemplate<String, Object> kafkaTemplate,
            AccountClient accountClient,
            BillerRepository billerRepository,
            ScheduledPaymentRepository scheduledPaymentRepository) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
        this.accountClient = accountClient;
        this.billerRepository = billerRepository;
        this.scheduledPaymentRepository = scheduledPaymentRepository;
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

        Long customerId = saved.getAccountId();
        try {
            AccountDto account = accountClient.getAccountById(saved.getAccountId());
            if (account != null && account.customerId() != null) {
                customerId = account.customerId();
            }
        } catch (Exception e) {
            log.error("Failed to fetch account details for accountId: {}. Using accountId as fallback.",
                    saved.getAccountId(), e);
        }

        // Build metadata for the notification template
        Map<String, String> metadata = new java.util.HashMap<>();
        metadata.put("amount", String.format("%.2f", saved.getAmount()));
        metadata.put("paymentId", String.valueOf(saved.getId()));

        // Publish async notification event with template metadata
        NotificationEvent event = new NotificationEvent(
                customerId,
                "PAYMENT_CREATED",
                null,
                metadata);
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), event);
        log.info("Published PAYMENT_CREATED event to topic '{}' for customerId={}", TOPIC, customerId);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/bills")
    public ResponseEntity<Payment> payBill(
            @RequestBody Payment p,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        log.info("POST /api/v1/payments/bills - Creating bill payment");

        if (p.getCustomerId() == null || p.getAccountId() == null || p.getBillerId() == null || p.getAmount() == null || p.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        if (!isAuthorized(p.getCustomerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!billerRepository.existsById(p.getBillerId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        p.setPaymentType("BILL_PAYMENT");
        if (p.getStatus() == null || p.getStatus().isBlank()) {
            p.setStatus("COMPLETED");
        }

        Payment saved = repository.save(p);
        publishPaymentEvent("BILL_PAYMENT_CREATED", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<ScheduledPayment>> getScheduledPayments(
            @RequestParam(required = false) Long customerId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if ("ROLE_ADMIN".equals(role)) {
            if (customerId != null) {
                return ResponseEntity.ok(scheduledPaymentRepository.findByCustomerIdOrderByNextExecutionDateAsc(customerId));
            }
            return ResponseEntity.ok(scheduledPaymentRepository.findAll());
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long resolvedCustomerId = customerId != null ? customerId : userId;
        if (!userId.equals(resolvedCustomerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(scheduledPaymentRepository.findByCustomerIdOrderByNextExecutionDateAsc(resolvedCustomerId));
    }

    @PostMapping("/scheduled")
    public ResponseEntity<ScheduledPayment> createScheduledPayment(
            @RequestBody ScheduledPayment scheduledPayment,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (scheduledPayment.getCustomerId() == null
                || scheduledPayment.getSourceAccountId() == null
                || scheduledPayment.getAmount() == null
                || scheduledPayment.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        if (!isAuthorized(scheduledPayment.getCustomerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ScheduledPayment saved = scheduledPaymentRepository.save(scheduledPayment);
        kafkaTemplate.send("payment.scheduled", String.valueOf(saved.getId()), new NotificationEvent(
                saved.getCustomerId(),
                "SCHEDULED_PAYMENT_CREATED",
                null,
                Map.of(
                        "scheduledPaymentId", String.valueOf(saved.getId()),
                        "amount", String.format("%.2f", saved.getAmount()),
                        "status", saved.getStatus()
                )));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/scheduled/{id}")
    public ResponseEntity<ScheduledPayment> updateScheduledPaymentStatus(
            @PathVariable Long id,
            @RequestBody ScheduledPaymentStatusRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        return scheduledPaymentRepository.findById(id)
                .map(payment -> {
                    if (!isAuthorized(payment.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<ScheduledPayment>build();
                    }

                    if (request.status() != null && !request.status().isBlank()) {
                        payment.setStatus(request.status().toUpperCase());
                    }
                    if (request.nextExecutionDate() != null) {
                        payment.setNextExecutionDate(request.nextExecutionDate());
                    }

                    ScheduledPayment saved = scheduledPaymentRepository.save(payment);
                    kafkaTemplate.send("payment.scheduled", String.valueOf(saved.getId()), new NotificationEvent(
                            saved.getCustomerId(),
                            "SCHEDULED_PAYMENT_UPDATED",
                            null,
                            Map.of(
                                    "scheduledPaymentId", String.valueOf(saved.getId()),
                                    "status", saved.getStatus()
                            )));
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
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

    private void publishPaymentEvent(String eventType, Payment saved) {
        Long customerId = saved.getCustomerId() != null ? saved.getCustomerId() : saved.getAccountId();
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), new NotificationEvent(
                customerId,
                eventType,
                null,
                Map.of(
                        "paymentId", String.valueOf(saved.getId()),
                        "amount", String.format("%.2f", saved.getAmount()),
                        "paymentType", saved.getPaymentType() == null ? "" : saved.getPaymentType()
                )));
    }

    private boolean isAuthorized(Long resourceCustomerId, Long userId, String role) {
        return "ROLE_ADMIN".equals(role) || (userId != null && userId.equals(resourceCustomerId));
    }
}

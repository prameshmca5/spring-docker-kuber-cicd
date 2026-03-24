package com.qacts.paymentservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billers")
@CrossOrigin(origins = "*")
public class BillerController {

    private static final String TOPIC = "biller.created";

    private final BillerRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public BillerController(BillerRepository repository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Biller>> getBillers(
            @RequestParam(required = false) Long customerId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if ("ROLE_ADMIN".equals(role)) {
            if (customerId != null) {
                return ResponseEntity.ok(repository.findByCustomerIdOrderByCreatedAtDesc(customerId));
            }
            return ResponseEntity.ok(repository.findAll());
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long resolvedCustomerId = customerId != null ? customerId : userId;
        if (!userId.equals(resolvedCustomerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(repository.findByCustomerIdOrderByCreatedAtDesc(resolvedCustomerId));
    }

    @PostMapping
    public ResponseEntity<Biller> createBiller(
            @RequestBody Biller biller,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (biller.getCustomerId() == null || biller.getBillerName() == null || biller.getBillerName().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        if (!isAuthorized(biller.getCustomerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Biller saved = repository.save(biller);
        kafkaTemplate.send(TOPIC, String.valueOf(saved.getId()), new NotificationEvent(
                saved.getCustomerId(),
                "BILLER_CREATED",
                null,
                Map.of(
                        "billerId", String.valueOf(saved.getId()),
                        "billerName", saved.getBillerName()
                )));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private boolean isAuthorized(Long resourceCustomerId, Long userId, String role) {
        return "ROLE_ADMIN".equals(role) || (userId != null && userId.equals(resourceCustomerId));
    }
}

package com.qacts.accountservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/standing-orders")
public class StandingOrderController {

    private static final String CREATED_TOPIC = "standing-order.created";
    private static final String UPDATED_TOPIC = "standing-order.updated";

    private final StandingOrderRepository repository;
    private final AccountRepository accountRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public StandingOrderController(
            StandingOrderRepository repository,
            AccountRepository accountRepository,
            KafkaTemplate<String, Object> kafkaTemplate
    ) {
        this.repository = repository;
        this.accountRepository = accountRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @GetMapping
    public ResponseEntity<List<StandingOrder>> getStandingOrders(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long sourceAccountId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if ("ROLE_ADMIN".equals(role)) {
            if (customerId != null) {
                return ResponseEntity.ok(repository.findByCustomerIdOrderByNextExecutionDateAsc(customerId));
            }
            if (sourceAccountId != null) {
                return ResponseEntity.ok(repository.findBySourceAccountIdOrderByNextExecutionDateAsc(sourceAccountId));
            }
            return ResponseEntity.ok(repository.findAll().stream()
                    .sorted(Comparator.comparing(StandingOrder::getNextExecutionDate))
                    .toList());
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long resolvedCustomerId = customerId != null ? customerId : userId;
        if (!userId.equals(resolvedCustomerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(repository.findByCustomerIdOrderByNextExecutionDateAsc(resolvedCustomerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StandingOrder> getStandingOrderById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return repository.findById(id)
                .map(order -> isAuthorized(order.getCustomerId(), userId, role)
                        ? ResponseEntity.ok(order)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<StandingOrder>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StandingOrder> createStandingOrder(
            @RequestBody StandingOrder order,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (order.getCustomerId() == null || order.getSourceAccountId() == null || order.getAmount() == null || order.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        if (!isAuthorized(order.getCustomerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean sourceAccountValid = accountRepository.findById(order.getSourceAccountId())
                .map(account -> account.getCustomerId().equals(order.getCustomerId()))
                .orElse(false);

        if (!sourceAccountValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        StandingOrder saved = repository.save(order);
        kafkaTemplate.send(CREATED_TOPIC, String.valueOf(saved.getId()), new NotificationEvent(
                saved.getCustomerId(),
                "STANDING_ORDER_CREATED",
                null,
                Map.of(
                        "standingOrderId", String.valueOf(saved.getId()),
                        "amount", String.format("%.2f", saved.getAmount()),
                        "beneficiaryName", saved.getBeneficiaryName() == null ? "" : saved.getBeneficiaryName()
                )));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StandingOrder> updateStandingOrderStatus(
            @PathVariable Long id,
            @RequestBody StandingOrderStatusRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return repository.findById(id)
                .map(order -> {
                    if (!isAuthorized(order.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<StandingOrder>build();
                    }

                    if (request.status() != null && !request.status().isBlank()) {
                        order.setStatus(request.status().toUpperCase());
                    }
                    if (request.nextExecutionDate() != null) {
                        order.setNextExecutionDate(request.nextExecutionDate());
                    }

                    StandingOrder saved = repository.save(order);
                    kafkaTemplate.send(UPDATED_TOPIC, String.valueOf(saved.getId()), new NotificationEvent(
                            saved.getCustomerId(),
                            "STANDING_ORDER_UPDATED",
                            null,
                            Map.of(
                                    "standingOrderId", String.valueOf(saved.getId()),
                                    "status", saved.getStatus(),
                                    "nextExecutionDate", String.valueOf(saved.getNextExecutionDate())
                            )));
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean isAuthorized(Long resourceCustomerId, Long userId, String role) {
        return "ROLE_ADMIN".equals(role) || (userId != null && userId.equals(resourceCustomerId));
    }
}

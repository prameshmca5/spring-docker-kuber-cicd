package com.qacts.transactionservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transfers")
public class TransferController {

    private static final String TRANSFER_CREATED_TOPIC = "transfer.created";
    private static final String TRANSFER_SCHEDULED_TOPIC = "transfer.scheduled";

    private final TransferInstructionRepository repository;
    private final TransactionRepository transactionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public TransferController(
            TransferInstructionRepository repository,
            TransactionRepository transactionRepository,
            KafkaTemplate<String, Object> kafkaTemplate
    ) {
        this.repository = repository;
        this.transactionRepository = transactionRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @GetMapping
    public ResponseEntity<List<TransferInstruction>> getTransfers(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String type,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if ("ROLE_ADMIN".equals(role)) {
            if (customerId != null && type != null) {
                return ResponseEntity.ok(repository.findByCustomerIdAndTransferTypeOrderByCreatedAtDesc(customerId, type));
            }
            if (customerId != null) {
                return ResponseEntity.ok(repository.findByCustomerIdOrderByCreatedAtDesc(customerId));
            }
            if (type != null) {
                return ResponseEntity.ok(repository.findByTransferTypeOrderByCreatedAtDesc(type));
            }
            return ResponseEntity.ok(repository.findAll().stream()
                    .sorted(Comparator.comparing(TransferInstruction::getCreatedAt).reversed())
                    .toList());
        }

        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long resolvedCustomerId = customerId != null ? customerId : userId;
        if (!userId.equals(resolvedCustomerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (type != null) {
            return ResponseEntity.ok(repository.findByCustomerIdAndTransferTypeOrderByCreatedAtDesc(resolvedCustomerId, type));
        }
        return ResponseEntity.ok(repository.findByCustomerIdOrderByCreatedAtDesc(resolvedCustomerId));
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<TransferInstruction>> getScheduledTransfers(
            @RequestParam(required = false) Long customerId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return getTransfers(customerId, "SCHEDULED_TRANSFER", userId, role);
    }

    @PostMapping("/internal")
    public ResponseEntity<TransferInstruction> createInternalTransfer(
            @RequestBody TransferInstructionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!isImmediateTransferValid(request) || request.targetAccountId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAuthorized(request.customerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TransferInstruction saved = saveTransfer(request, "BETWEEN_OWN_ACCOUNTS", "COMPLETED");
        createTransaction(saved.getSourceAccountId(), -Math.abs(saved.getAmount()), "TRANSFER_DEBIT");
        createTransaction(saved.getTargetAccountId(), Math.abs(saved.getAmount()), "TRANSFER_CREDIT");
        publishTransferEvent(TRANSFER_CREATED_TOPIC, "TRANSFER_CREATED", saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/local")
    public ResponseEntity<TransferInstruction> createLocalTransfer(
            @RequestBody TransferInstructionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!isImmediateTransferValid(request)) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAuthorized(request.customerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TransferInstruction saved = saveTransfer(request, "LOCAL_TRANSFER", "COMPLETED");
        createTransaction(saved.getSourceAccountId(), -Math.abs(saved.getAmount()), "LOCAL_TRANSFER_DEBIT");
        publishTransferEvent(TRANSFER_CREATED_TOPIC, "LOCAL_TRANSFER_CREATED", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/local/one-time")
    public ResponseEntity<TransferInstruction> createOneTimeLocalTransfer(
            @RequestBody TransferInstructionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!isImmediateTransferValid(request)) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAuthorized(request.customerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TransferInstruction saved = saveTransfer(request, "ONE_TIME_LOCAL_TRANSFER", "COMPLETED");
        createTransaction(saved.getSourceAccountId(), -Math.abs(saved.getAmount()), "ONE_TIME_LOCAL_TRANSFER_DEBIT");
        publishTransferEvent(TRANSFER_CREATED_TOPIC, "ONE_TIME_LOCAL_TRANSFER_CREATED", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/international")
    public ResponseEntity<TransferInstruction> createInternationalTransfer(
            @RequestBody TransferInstructionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!isImmediateTransferValid(request) || request.destinationCountry() == null || request.destinationCountry().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAuthorized(request.customerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TransferInstruction saved = saveTransfer(request, "INTERNATIONAL_TRANSFER", "PENDING_COMPLIANCE");
        publishTransferEvent(TRANSFER_CREATED_TOPIC, "INTERNATIONAL_TRANSFER_CREATED", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/scheduled")
    public ResponseEntity<TransferInstruction> createScheduledTransfer(
            @RequestBody TransferInstructionRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (request.customerId() == null || request.sourceAccountId() == null || request.amount() == null || request.amount() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAuthorized(request.customerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        TransferInstruction saved = new TransferInstruction();
        saved.setCustomerId(request.customerId());
        saved.setSourceAccountId(request.sourceAccountId());
        saved.setTargetAccountId(request.targetAccountId());
        saved.setBeneficiaryName(request.beneficiaryName());
        saved.setBeneficiaryAccountNumber(request.beneficiaryAccountNumber());
        saved.setBeneficiaryBankCode(request.beneficiaryBankCode());
        saved.setDestinationCountry(request.destinationCountry());
        saved.setAmount(request.amount());
        saved.setCurrency(request.currency());
        saved.setTransferType("SCHEDULED_TRANSFER");
        saved.setSchedulePattern(request.schedulePattern() == null || request.schedulePattern().isBlank() ? "MONTHLY" : request.schedulePattern());
        saved.setScheduledFor(request.scheduledFor() == null ? LocalDateTime.now().plusDays(1) : request.scheduledFor());
        saved.setStatus("SCHEDULED");
        saved.setRemarks(request.remarks());
        saved = repository.save(saved);

        publishTransferEvent(TRANSFER_SCHEDULED_TOPIC, "TRANSFER_SCHEDULED", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/scheduled/{id}")
    public ResponseEntity<TransferInstruction> updateScheduledTransfer(
            @PathVariable Long id,
            @RequestBody TransferScheduleUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return repository.findById(id)
                .map(transfer -> {
                    if (!"SCHEDULED_TRANSFER".equals(transfer.getTransferType())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).<TransferInstruction>build();
                    }
                    if (!isAuthorized(transfer.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<TransferInstruction>build();
                    }

                    if (request.status() != null && !request.status().isBlank()) {
                        transfer.setStatus(request.status().toUpperCase());
                    }
                    if (request.schedulePattern() != null && !request.schedulePattern().isBlank()) {
                        transfer.setSchedulePattern(request.schedulePattern().toUpperCase());
                    }
                    if (request.scheduledFor() != null) {
                        transfer.setScheduledFor(request.scheduledFor());
                    }

                    TransferInstruction saved = repository.save(transfer);
                    publishTransferEvent(TRANSFER_SCHEDULED_TOPIC, "TRANSFER_SCHEDULE_UPDATED", saved);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private TransferInstruction saveTransfer(TransferInstructionRequest request, String type, String status) {
        TransferInstruction transfer = new TransferInstruction();
        transfer.setCustomerId(request.customerId());
        transfer.setSourceAccountId(request.sourceAccountId());
        transfer.setTargetAccountId(request.targetAccountId());
        transfer.setBeneficiaryName(request.beneficiaryName());
        transfer.setBeneficiaryAccountNumber(request.beneficiaryAccountNumber());
        transfer.setBeneficiaryBankCode(request.beneficiaryBankCode());
        transfer.setDestinationCountry(request.destinationCountry());
        transfer.setAmount(request.amount());
        transfer.setCurrency(request.currency());
        transfer.setTransferType(type);
        transfer.setSchedulePattern(request.schedulePattern());
        transfer.setScheduledFor(request.scheduledFor());
        transfer.setStatus(status);
        transfer.setRemarks(request.remarks());
        return repository.save(transfer);
    }

    private void createTransaction(Long accountId, Double amount, String type) {
        if (accountId == null) {
            return;
        }
        BankTransaction transaction = new BankTransaction();
        transaction.setAccountId(accountId);
        transaction.setAmount(amount);
        transaction.setType(type);
        transactionRepository.save(transaction);
    }

    private void publishTransferEvent(String topic, String eventType, TransferInstruction transfer) {
        kafkaTemplate.send(topic, String.valueOf(transfer.getId()), new NotificationEvent(
                transfer.getCustomerId(),
                eventType,
                null,
                Map.of(
                        "transferId", String.valueOf(transfer.getId()),
                        "amount", String.format("%.2f", transfer.getAmount()),
                        "transferType", transfer.getTransferType(),
                        "status", transfer.getStatus()
                )));
    }

    private boolean isImmediateTransferValid(TransferInstructionRequest request) {
        return request.customerId() != null
                && request.sourceAccountId() != null
                && request.amount() != null
                && request.amount() > 0;
    }

    private boolean isAuthorized(Long resourceCustomerId, Long userId, String role) {
        return "ROLE_ADMIN".equals(role) || (userId != null && userId.equals(resourceCustomerId));
    }
}

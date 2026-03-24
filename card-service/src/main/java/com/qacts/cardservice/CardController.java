package com.qacts.cardservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cards")
@CrossOrigin(origins = "*")
public class CardController {

    private final CreditCardRepository cardRepository;
    private final CardTransactionRepository transactionRepository;

    public CardController(CreditCardRepository cardRepository, CardTransactionRepository transactionRepository) {
        this.cardRepository = cardRepository;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public ResponseEntity<List<CreditCardAccount>> getAll(
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(cardRepository.findAll());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CreditCardAccount>> getByCustomerId(
            @PathVariable Long customerId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!isAuthorized(customerId, userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(cardRepository.findByCustomerId(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreditCardAccount> getById(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return cardRepository.findById(id)
                .map(card -> isAuthorized(card.getCustomerId(), userId, role)
                        ? ResponseEntity.ok(card)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<CreditCardAccount>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CreditCardAccount> create(
            @RequestBody CreditCardAccount card,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (card.getCustomerId() == null || card.getCardHolderName() == null || card.getCreditLimit() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAuthorized(card.getCustomerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(cardRepository.save(card));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return cardRepository.findById(id)
                .map(card -> {
                    if (!isAuthorized(card.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Map<String, Object>>build();
                    }

                    double utilization = card.getCreditLimit() == null || card.getCreditLimit() == 0
                            ? 0.0
                            : (card.getOutstandingBalance() / card.getCreditLimit()) * 100.0;

                    Map<String, Object> payload = new LinkedHashMap<>();
                    payload.put("cardId", card.getId());
                    payload.put("customerId", card.getCustomerId());
                    payload.put("cardType", card.getCardType());
                    payload.put("status", card.getStatus());
                    payload.put("creditLimit", card.getCreditLimit());
                    payload.put("availableLimit", card.getAvailableLimit());
                    payload.put("outstandingBalance", card.getOutstandingBalance());
                    payload.put("utilizationPercentage", Math.round(utilization * 100.0) / 100.0);
                    payload.put("paymentDueDate", card.getPaymentDueDate());
                    payload.put("statementDate", card.getStatementDate());
                    return ResponseEntity.ok(payload);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<CardTransaction>> getTransactions(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return cardRepository.findById(id)
                .map(card -> isAuthorized(card.getCustomerId(), userId, role)
                        ? ResponseEntity.ok(transactionRepository.findByCardIdOrderByTransactionDateDesc(id))
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<List<CardTransaction>>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/transactions")
    public ResponseEntity<CardTransaction> createTransaction(
            @PathVariable Long id,
            @RequestBody CardTransaction transaction,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return cardRepository.findById(id)
                .map(card -> {
                    if (!isAuthorized(card.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<CardTransaction>build();
                    }

                    transaction.setCardId(id);
                    CardTransaction saved = transactionRepository.save(transaction);

                    double signedAmount = "CREDIT".equalsIgnoreCase(saved.getEntryType())
                            ? -Math.abs(saved.getAmount())
                            : Math.abs(saved.getAmount());

                    double outstanding = Math.max(0.0, (card.getOutstandingBalance() == null ? 0.0 : card.getOutstandingBalance()) + signedAmount);
                    card.setOutstandingBalance(outstanding);
                    card.setAvailableLimit(Math.max(0.0, (card.getCreditLimit() == null ? 0.0 : card.getCreditLimit()) - outstanding));
                    cardRepository.save(card);

                    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/controls")
    public ResponseEntity<CreditCardAccount> updateControls(
            @PathVariable Long id,
            @RequestBody CardControlUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return cardRepository.findById(id)
                .map(card -> {
                    if (!isAuthorized(card.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<CreditCardAccount>build();
                    }

                    if (request.internationalEnabled() != null) {
                        card.setInternationalEnabled(request.internationalEnabled());
                    }
                    if (request.onlineEnabled() != null) {
                        card.setOnlineEnabled(request.onlineEnabled());
                    }
                    if (request.cashAdvanceEnabled() != null) {
                        card.setCashAdvanceEnabled(request.cashAdvanceEnabled());
                    }
                    if (request.status() != null && !request.status().isBlank()) {
                        card.setStatus(request.status().toUpperCase());
                    }

                    return ResponseEntity.ok(cardRepository.save(card));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private boolean isAuthorized(Long resourceCustomerId, Long userId, String role) {
        return "ROLE_ADMIN".equals(role) || (userId != null && userId.equals(resourceCustomerId));
    }
}

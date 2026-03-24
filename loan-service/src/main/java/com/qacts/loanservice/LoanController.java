package com.qacts.loanservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/loans")
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanAccountRepository loanRepository;
    private final LoanRepaymentRepository repaymentRepository;
    private final LoanLifecycleEventRepository lifecycleRepository;

    public LoanController(
            LoanAccountRepository loanRepository,
            LoanRepaymentRepository repaymentRepository,
            LoanLifecycleEventRepository lifecycleRepository
    ) {
        this.loanRepository = loanRepository;
        this.repaymentRepository = repaymentRepository;
        this.lifecycleRepository = lifecycleRepository;
    }

    @GetMapping
    public ResponseEntity<List<LoanAccount>> getAll(
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!"ROLE_ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(loanRepository.findAll());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<LoanAccount>> getByCustomerId(
            @PathVariable Long customerId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (!isAuthorized(customerId, userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(loanRepository.findByCustomerId(customerId));
    }

    @GetMapping("/{loanId}")
    public ResponseEntity<LoanAccount> getById(
            @PathVariable Long loanId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return loanRepository.findById(loanId)
                .map(loan -> isAuthorized(loan.getCustomerId(), userId, role)
                        ? ResponseEntity.ok(loan)
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<LoanAccount>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LoanAccount> create(
            @RequestBody LoanAccount loan,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (loan.getCustomerId() == null || loan.getPrincipalAmount() == null || loan.getPrincipalAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        if (!isAuthorized(loan.getCustomerId(), userId, role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        LoanAccount saved = loanRepository.save(loan);
        lifecycleRepository.save(buildLifecycleEvent(saved.getId(), "LOAN_CREATED", "Loan facility/application created"));
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{loanId}/history")
    public ResponseEntity<List<LoanLifecycleEvent>> getHistory(
            @PathVariable Long loanId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return loanRepository.findById(loanId)
                .map(loan -> isAuthorized(loan.getCustomerId(), userId, role)
                        ? ResponseEntity.ok(lifecycleRepository.findByLoanIdOrderByEventDateDesc(loanId))
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<List<LoanLifecycleEvent>>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{loanId}/repayments")
    public ResponseEntity<List<LoanRepayment>> getRepayments(
            @PathVariable Long loanId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return loanRepository.findById(loanId)
                .map(loan -> isAuthorized(loan.getCustomerId(), userId, role)
                        ? ResponseEntity.ok(repaymentRepository.findByLoanIdOrderByPaymentDateDesc(loanId))
                        : ResponseEntity.status(HttpStatus.FORBIDDEN).<List<LoanRepayment>>build())
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{loanId}/repayments")
    public ResponseEntity<LoanRepayment> createRepayment(
            @PathVariable Long loanId,
            @RequestBody LoanRepaymentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return loanRepository.findById(loanId)
                .map(loan -> {
                    if (!isAuthorized(loan.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<LoanRepayment>build();
                    }
                    if (request.amount() == null || request.amount() <= 0) {
                        return ResponseEntity.badRequest().<LoanRepayment>build();
                    }

                    double interestComponent = Math.min(request.amount() * 0.2, request.amount());
                    double principalComponent = request.amount() - interestComponent;

                    LoanRepayment repayment = new LoanRepayment();
                    repayment.setLoanId(loanId);
                    repayment.setAmount(request.amount());
                    repayment.setPrincipalComponent(principalComponent);
                    repayment.setInterestComponent(interestComponent);
                    repayment.setPaymentChannel(request.paymentChannel());
                    repayment.setReferenceNumber(request.referenceNumber());
                    LoanRepayment saved = repaymentRepository.save(repayment);

                    loan.setOutstandingBalance(Math.max(0.0, loan.getOutstandingBalance() - principalComponent));
                    if (loan.getOutstandingBalance() == 0.0) {
                        loan.setStatus("CLOSED");
                    }
                    loanRepository.save(loan);
                    lifecycleRepository.save(buildLifecycleEvent(loanId, "LOAN_REPAYMENT_CAPTURED", "Loan repayment recorded"));

                    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{loanId}/schedule")
    public ResponseEntity<List<LoanScheduleItem>> getSchedule(
            @PathVariable Long loanId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        return loanRepository.findById(loanId)
                .map(loan -> {
                    if (!isAuthorized(loan.getCustomerId(), userId, role)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<List<LoanScheduleItem>>build();
                    }

                    List<LoanScheduleItem> schedule = new ArrayList<>();
                    double projectedOutstanding = loan.getOutstandingBalance();
                    for (int installment = 1; installment <= loan.getTenureMonths(); installment++) {
                        projectedOutstanding = Math.max(0.0, projectedOutstanding - loan.getMonthlyInstallment());
                        schedule.add(new LoanScheduleItem(
                                installment,
                                loan.getStartDate().plusMonths(installment),
                                loan.getMonthlyInstallment(),
                                projectedOutstanding
                        ));
                    }
                    return ResponseEntity.ok(schedule);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private LoanLifecycleEvent buildLifecycleEvent(Long loanId, String eventType, String description) {
        LoanLifecycleEvent event = new LoanLifecycleEvent();
        event.setLoanId(loanId);
        event.setEventType(eventType);
        event.setDescription(description);
        return event;
    }

    private boolean isAuthorized(Long resourceCustomerId, Long userId, String role) {
        return "ROLE_ADMIN".equals(role) || (userId != null && userId.equals(resourceCustomerId));
    }
}

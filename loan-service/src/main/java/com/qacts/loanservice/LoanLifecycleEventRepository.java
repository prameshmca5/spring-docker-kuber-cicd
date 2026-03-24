package com.qacts.loanservice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanLifecycleEventRepository extends JpaRepository<LoanLifecycleEvent, Long> {
    List<LoanLifecycleEvent> findByLoanIdOrderByEventDateDesc(Long loanId);
}

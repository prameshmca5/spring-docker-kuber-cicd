package com.qacts.accountservice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StandingOrderRepository extends JpaRepository<StandingOrder, Long> {
    List<StandingOrder> findByCustomerIdOrderByNextExecutionDateAsc(Long customerId);
    List<StandingOrder> findBySourceAccountIdOrderByNextExecutionDateAsc(Long sourceAccountId);
}

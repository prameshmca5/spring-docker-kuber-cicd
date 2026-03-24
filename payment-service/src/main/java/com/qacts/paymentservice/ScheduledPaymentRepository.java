package com.qacts.paymentservice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduledPaymentRepository extends JpaRepository<ScheduledPayment, Long> {
    List<ScheduledPayment> findByCustomerIdOrderByNextExecutionDateAsc(Long customerId);
}

package com.qacts.paymentservice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillerRepository extends JpaRepository<Biller, Long> {
    List<Biller> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}

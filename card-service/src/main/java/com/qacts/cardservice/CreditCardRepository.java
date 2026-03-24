package com.qacts.cardservice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditCardRepository extends JpaRepository<CreditCardAccount, Long> {
    List<CreditCardAccount> findByCustomerId(Long customerId);
}

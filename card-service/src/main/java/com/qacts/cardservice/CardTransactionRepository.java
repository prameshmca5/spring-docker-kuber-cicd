package com.qacts.cardservice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardTransactionRepository extends JpaRepository<CardTransaction, Long> {
    List<CardTransaction> findByCardIdOrderByTransactionDateDesc(Long cardId);
}

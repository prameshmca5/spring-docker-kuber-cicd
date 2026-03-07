package com.qacts.transactionservice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByAccountId(Long accountId);
}

package com.qacts.transactionservice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransferInstructionRepository extends JpaRepository<TransferInstruction, Long> {
    List<TransferInstruction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<TransferInstruction> findByCustomerIdAndTransferTypeOrderByCreatedAtDesc(Long customerId, String transferType);
    List<TransferInstruction> findByTransferTypeOrderByCreatedAtDesc(String transferType);
}

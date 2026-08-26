package com.recoverai.repository;

import com.recoverai.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, String> {
    List<PaymentAttempt> findByTransactionIdOrderByAttemptNumberAsc(String transactionId);
}

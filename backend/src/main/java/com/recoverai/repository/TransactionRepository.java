package com.recoverai.repository;

import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByTransactionId(String transactionId);

    List<Transaction> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    long countByStatus(TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status IN (:statuses)")
    BigDecimal sumAmountByStatuses(@Param("statuses") List<TransactionStatus> statuses);

    @Query("SELECT t.failureReason, COUNT(t) FROM Transaction t WHERE t.failureReason IS NOT NULL GROUP BY t.failureReason")
    List<Object[]> countGroupedByFailureReason();

    @Query("SELECT t FROM Transaction t WHERE t.status IN ('AT_RISK', 'FAILED') ORDER BY t.amount DESC")
    List<Transaction> findTopAtRiskTransactions(Pageable pageable);

    @Query("SELECT t FROM Transaction t LEFT JOIN t.recoveryActions a WHERE t.status IN ('FAILED', 'AT_RISK') AND a.id IS NULL ORDER BY t.createdAt ASC")
    List<Transaction> findUnprocessedFailedTransactions(Pageable pageable);
}

package com.recoverai.repository;

import com.recoverai.entity.RecoveryAction;
import com.recoverai.entity.enums.RecoveryActionStatus;
import com.recoverai.entity.enums.RecoveryActionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecoveryActionRepository extends JpaRepository<RecoveryAction, String> {

    Page<RecoveryAction> findByStatus(RecoveryActionStatus status, Pageable pageable);

    List<RecoveryAction> findByTransactionIdOrderByCreatedAtDesc(String transactionId);

    long countByActionType(RecoveryActionType actionType);

    @Query("SELECT r.actionType, COUNT(r), COALESCE(SUM(r.expectedRecoveryAmount), 0) FROM RecoveryAction r GROUP BY r.actionType")
    List<Object[]> countAndSumGroupedByActionType();
}

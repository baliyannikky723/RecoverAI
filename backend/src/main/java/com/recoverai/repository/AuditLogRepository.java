package com.recoverai.repository;

import com.recoverai.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String>, JpaSpecificationExecutor<AuditLog> {

    List<AuditLog> findByTransactionIdOrderByTimestampDesc(String transactionId);

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}

package com.recoverai.dto;

import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RecoveryPriority;
import com.recoverai.entity.enums.RiskLevel;
import com.recoverai.entity.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetailDto {
    private String id;
    private String transactionId;
    private CustomerSummaryDto customer;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private TransactionStatus status;
    private FailureReason failureReason;
    private RiskLevel riskLevel;
    private RecoveryPriority recoveryPriority;
    private Instant createdAt;
    private Instant updatedAt;
    private List<PaymentAttemptDto> paymentAttempts;
    private List<RecoveryActionDto> recoveryActions;
    private List<AuditLogDto> auditLogs;
}

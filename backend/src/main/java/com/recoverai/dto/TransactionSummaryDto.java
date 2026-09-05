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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSummaryDto {
    private String id;
    private String transactionId;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private TransactionStatus status;
    private FailureReason failureReason;
    private RiskLevel riskLevel;
    private RecoveryPriority recoveryPriority;
    private Boolean aiReviewReady;
    private Instant createdAt;
    private Instant updatedAt;
}

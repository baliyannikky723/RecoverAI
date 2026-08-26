package com.recoverai.dto;

import com.recoverai.entity.enums.RecoveryActionStatus;
import com.recoverai.entity.enums.RecoveryActionType;
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
public class RecoveryActionDto {
    private String id;
    private String transactionId;
    private String customerName;
    private BigDecimal amount;
    private String currency;
    private RecoveryActionType actionType;
    private Double confidence;
    private BigDecimal expectedRecoveryAmount;
    private RecoveryActionStatus status;
    private String reason;
    private Instant createdAt;
    private Instant executedAt;
}

package com.recoverai.dto;

import com.recoverai.entity.enums.RecoveryActionType;
import com.recoverai.entity.enums.RiskLevel;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIRecoveryDecision {
    private RecoveryActionType action;
    private Double confidence;
    private String reason;
    private BigDecimal expectedRecoveryAmount;
    private Integer retryAfterHours;
    private RiskLevel riskLevel;
    private String decisionId;
    private String transactionId;
    private Instant generatedAt;
    private Boolean guardrailRejected;
}

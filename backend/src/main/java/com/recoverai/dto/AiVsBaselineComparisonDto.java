package com.recoverai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiVsBaselineComparisonDto {
    private BigDecimal baselineRecoveredRevenue;
    private BigDecimal aiRecoveredRevenue;
    private Double baselineRecoveryRate;
    private Double aiRecoveryRate;
    private Double aiUpliftPercentage;
    private Long baselineAttempts;
    private Long aiAttempts;
    private Long baselineEscalations;
    private Long aiEscalations;
    private Long baselineStopped;
    private Long aiStopped;
    private Long totalEvaluatedTransactions;
    private BigDecimal totalEvaluatedVolume;
    private BigDecimal netGain;
    private Long additionalRecoveredInvoices;
}

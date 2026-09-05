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
public class RecoveryPerformanceDto {
    private BigDecimal revenueAtRisk;
    private BigDecimal revenueRecovered;
    private Double recoveryRate;
    private Long totalRecoveredTransactions;
    private Long totalFailedRecoveries;
    private Long totalRetries;
    private Long totalPaymentLinkRecoveries;
    private Long totalMethodUpdateRecoveries;
    private Long totalHumanEscalations;
    private Long totalStoppedRecoveries;
    private Double averageRecoveryAttempts;
    private Double averageRecoveryTimeHours;
    private Long totalInvoices;
}

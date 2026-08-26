package com.recoverai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto {
    private BigDecimal revenueAtRisk;
    private BigDecimal revenueRecovered;
    private Double recoveryRate;
    private Double averageRecoveryTimeHours;
    private Long totalInvoices;
}

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
public class RecoveryComparisonDto {
    private BigDecimal baselineRevenue;
    private BigDecimal recoverAiRevenue;
    private Double improvementPercentage;
    private Double baselineRate;
    private Double recoverAiRate;
    private BigDecimal netGain;
    private Long additionalRecoveredInvoices;
}

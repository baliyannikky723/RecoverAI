package com.recoverai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private BigDecimal revenueAtRisk;
    private BigDecimal revenueRecovered;
    private Double recoveryRate;
    private Long transactionsAtRisk;
    private List<MonthlyTrendDto> revenueOverview;
    private List<ActionEfficiencyDto> recoveryByAction;
    private List<FailureReasonDistributionDto> failureReasonDistribution;
    private List<TransactionSummaryDto> highPriorityTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendDto {
        private String month;
        private BigDecimal atRisk;
        private BigDecimal recovered;
        private BigDecimal baseline;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActionEfficiencyDto {
        private String action;
        private BigDecimal recoveredAmount;
        private Long count;
        private Double successRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailureReasonDistributionDto {
        private String reason;
        private Long count;
        private Double percentage;
    }
}

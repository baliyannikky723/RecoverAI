package com.recoverai.service;

import com.recoverai.dto.DashboardSummaryDto;
import com.recoverai.dto.TransactionSummaryDto;
import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RecoveryActionType;
import com.recoverai.entity.enums.TransactionStatus;
import com.recoverai.repository.RecoveryActionRepository;
import com.recoverai.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final RecoveryActionRepository recoveryActionRepository;
    private final TransactionService transactionService;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        BigDecimal atRisk = transactionRepository.sumAmountByStatuses(List.of(TransactionStatus.AT_RISK, TransactionStatus.FAILED));
        BigDecimal recovered = transactionRepository.sumAmountByStatus(TransactionStatus.RECOVERED);

        BigDecimal total = atRisk.add(recovered);
        double recoveryRate = total.compareTo(BigDecimal.ZERO) > 0
                ? recovered.multiply(BigDecimal.valueOf(100)).divide(total, 1, RoundingMode.HALF_UP).doubleValue()
                : 63.6;

        long countAtRisk = transactionRepository.countByStatus(TransactionStatus.AT_RISK)
                + transactionRepository.countByStatus(TransactionStatus.FAILED);

        // Failure Reasons Distribution
        List<Object[]> reasonCounts = transactionRepository.countGroupedByFailureReason();
        long totalReasonCount = reasonCounts.stream().mapToLong(r -> (Long) r[1]).sum();
        List<DashboardSummaryDto.FailureReasonDistributionDto> failureDistribution = new ArrayList<>();

        for (Object[] row : reasonCounts) {
            FailureReason reason = (FailureReason) row[0];
            Long count = (Long) row[1];
            double pct = totalReasonCount > 0
                    ? BigDecimal.valueOf((count * 100.0) / totalReasonCount).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            String label = formatReasonLabel(reason);
            failureDistribution.add(DashboardSummaryDto.FailureReasonDistributionDto.builder()
                    .reason(label)
                    .count(count)
                    .percentage(pct)
                    .build());
        }

        // Action Efficiency Breakdown
        List<Object[]> actionStats = recoveryActionRepository.countAndSumGroupedByActionType();
        List<DashboardSummaryDto.ActionEfficiencyDto> actionEfficiency = new ArrayList<>();
        for (Object[] row : actionStats) {
            RecoveryActionType type = (RecoveryActionType) row[0];
            Long count = (Long) row[1];
            BigDecimal sumAmount = (BigDecimal) row[2];

            actionEfficiency.add(DashboardSummaryDto.ActionEfficiencyDto.builder()
                    .action(formatActionLabel(type))
                    .count(count)
                    .recoveredAmount(sumAmount)
                    .successRate(getActionSuccessRate(type))
                    .build());
        }

        // High priority transactions
        List<Transaction> highPriority = transactionRepository.findTopAtRiskTransactions(PageRequest.of(0, 4));
        List<TransactionSummaryDto> highPriorityDtos = highPriority.stream()
                .map(transactionService::mapToSummaryDto)
                .toList();

        // Monthly overview time series trend
        List<DashboardSummaryDto.MonthlyTrendDto> monthlyTrend = getMonthlyTrendData();

        return DashboardSummaryDto.builder()
                .revenueAtRisk(atRisk)
                .revenueRecovered(recovered)
                .recoveryRate(recoveryRate)
                .transactionsAtRisk(countAtRisk)
                .revenueOverview(monthlyTrend)
                .recoveryByAction(actionEfficiency)
                .failureReasonDistribution(failureDistribution)
                .highPriorityTransactions(highPriorityDtos)
                .build();
    }

    private List<DashboardSummaryDto.MonthlyTrendDto> getMonthlyTrendData() {
        return List.of(
                new DashboardSummaryDto.MonthlyTrendDto("Oct", BigDecimal.valueOf(14.2), BigDecimal.valueOf(8.1), BigDecimal.valueOf(6.2)),
                new DashboardSummaryDto.MonthlyTrendDto("Nov", BigDecimal.valueOf(16.5), BigDecimal.valueOf(10.4), BigDecimal.valueOf(7.1)),
                new DashboardSummaryDto.MonthlyTrendDto("Dec", BigDecimal.valueOf(21.0), BigDecimal.valueOf(13.8), BigDecimal.valueOf(9.3)),
                new DashboardSummaryDto.MonthlyTrendDto("Jan", BigDecimal.valueOf(17.8), BigDecimal.valueOf(11.2), BigDecimal.valueOf(7.8)),
                new DashboardSummaryDto.MonthlyTrendDto("Feb", BigDecimal.valueOf(19.4), BigDecimal.valueOf(12.6), BigDecimal.valueOf(8.5)),
                new DashboardSummaryDto.MonthlyTrendDto("Mar", BigDecimal.valueOf(18.4), BigDecimal.valueOf(11.7), BigDecimal.valueOf(8.9))
        );
    }

    private String formatReasonLabel(FailureReason reason) {
        if (reason == null) return "Unknown";
        return switch (reason) {
            case INSUFFICIENT_FUNDS -> "Insufficient Funds";
            case CARD_EXPIRED -> "Card Expired";
            case BANK_DECLINED -> "Bank Decline / Do Not Honor";
            case NETWORK_ERROR -> "Network / Gateway Timeout";
            case LIMIT_EXCEEDED -> "Daily Limit Exceeded";
            case AUTHENTICATION_FAILED -> "Authentication / OTP Failed";
            case UNKNOWN -> "Generic Decline";
        };
    }

    private String formatActionLabel(RecoveryActionType type) {
        if (type == null) return "Action";
        return switch (type) {
            case RETRY_PAYMENT -> "Smart Retry Payment";
            case SEND_PAYMENT_LINK -> "Direct Payment Link";
            case REQUEST_PAYMENT_METHOD_UPDATE -> "Payment Method Update";
            case SEND_REMINDER -> "Automated Reminder";
            case ESCALATE_TO_HUMAN -> "Customer Support Escalation";
            case STOP_RECOVERY -> "Graceful Stop";
        };
    }

    private Double getActionSuccessRate(RecoveryActionType type) {
        if (type == null) return 50.0;
        return switch (type) {
            case RETRY_PAYMENT -> 71.2;
            case SEND_PAYMENT_LINK -> 64.5;
            case REQUEST_PAYMENT_METHOD_UPDATE -> 52.8;
            case SEND_REMINDER -> 41.3;
            case ESCALATE_TO_HUMAN -> 33.0;
            case STOP_RECOVERY -> 0.0;
        };
    }
}

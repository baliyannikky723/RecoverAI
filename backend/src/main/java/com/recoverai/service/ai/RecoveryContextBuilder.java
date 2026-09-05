package com.recoverai.service.ai;

import com.recoverai.entity.Transaction;
import com.recoverai.entity.Customer;
import com.recoverai.entity.PaymentAttempt;
import com.recoverai.entity.RecoveryAction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class RecoveryContextBuilder {

    public Map<String, Object> buildContext(Transaction transaction) {
        Map<String, Object> context = new HashMap<>();

        // 1. Transaction details
        Map<String, Object> txnMap = new HashMap<>();
        txnMap.put("transactionId", transaction.getTransactionId());
        txnMap.put("amount", transaction.getAmount());
        txnMap.put("currency", transaction.getCurrency());
        txnMap.put("paymentMethod", sanitizePaymentMethod(transaction.getPaymentMethod()));
        txnMap.put("status", transaction.getStatus().name());
        txnMap.put("failureReason", transaction.getFailureReason() != null ? transaction.getFailureReason().name() : null);
        
        Duration timeSinceFailure = Duration.between(transaction.getCreatedAt(), Instant.now());
        long hoursSinceFailure = timeSinceFailure.toHours();
        txnMap.put("timeSinceFailureHours", hoursSinceFailure);
        txnMap.put("hoursSinceFailure", hoursSinceFailure);
        context.put("transaction", txnMap);

        // 2. Customer details
        Customer customer = transaction.getCustomer();
        Map<String, Object> custMap = new HashMap<>();
        custMap.put("customerId", customer.getId());
        custMap.put("lifetimeValue", customer.getLifetimeValue());
        
        int successfulPayments = customer.getSuccessfulPaymentCount() != null ? customer.getSuccessfulPaymentCount() : 0;
        int failedPayments = customer.getFailedPaymentCount() != null ? customer.getFailedPaymentCount() : 0;
        custMap.put("successfulPaymentCount", successfulPayments);
        custMap.put("failedPaymentCount", failedPayments);
        
        double successRate = 0.0;
        double failureRate = 0.0;
        int totalCustomerPayments = successfulPayments + failedPayments;
        if (totalCustomerPayments > 0) {
            successRate = (double) successfulPayments / totalCustomerPayments;
            failureRate = (double) failedPayments / totalCustomerPayments;
        }
        custMap.put("successRate", successRate);
        custMap.put("failureRate", failureRate);
        
        BigDecimal avgTxnValue = BigDecimal.ZERO;
        if (successfulPayments > 0) {
            avgTxnValue = customer.getLifetimeValue().divide(
                BigDecimal.valueOf(successfulPayments), 2, RoundingMode.HALF_UP
            );
        }
        custMap.put("averageTransactionValue", avgTxnValue);
        
        BigDecimal amountVsAverageTransaction = BigDecimal.ZERO;
        if (avgTxnValue.compareTo(BigDecimal.ZERO) > 0) {
            amountVsAverageTransaction = transaction.getAmount()
                .divide(avgTxnValue, 2, RoundingMode.HALF_UP);
        }
        custMap.put("amountVsAverageTransaction", amountVsAverageTransaction);

        double recentPaymentSuccessRate = 0.0;
        if (customer.getTransactions() != null && !customer.getTransactions().isEmpty()) {
            List<Transaction> recentTxns = customer.getTransactions().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
            long successfulRecent = recentTxns.stream()
                .filter(t -> t.getStatus() == com.recoverai.entity.enums.TransactionStatus.RECOVERED)
                .count();
            recentPaymentSuccessRate = (double) successfulRecent / recentTxns.size();
            
            List<String> recentHistory = recentTxns.stream()
                .map(t -> t.getStatus().name())
                .collect(Collectors.toList());
            custMap.put("recentPaymentHistory", recentHistory);
        }
        custMap.put("recentPaymentSuccessRate", recentPaymentSuccessRate);
        context.put("customer", custMap);

        // 3. Payment attempts
        List<PaymentAttempt> attempts = transaction.getPaymentAttempts();
        Map<String, Object> attemptsMap = new HashMap<>();
        int attemptCount = 0;
        int previousRetryCount = 0;
        if (attempts != null && !attempts.isEmpty()) {
            attemptCount = attempts.size();
            previousRetryCount = attemptCount - 1;
            attemptsMap.put("totalAttempts", attemptCount);
            attemptsMap.put("attemptCount", attemptCount);
            attemptsMap.put("previousRetryCount", previousRetryCount);
            
            List<Map<String, Object>> recentAttemptsList = attempts.stream()
                .sorted((a, b) -> {
                    Instant aTime = a.getAttemptedAt() != null ? a.getAttemptedAt() : Instant.MIN;
                    Instant bTime = b.getAttemptedAt() != null ? b.getAttemptedAt() : Instant.MIN;
                    return bTime.compareTo(aTime);
                })
                .map(attempt -> {
                    Map<String, Object> att = new HashMap<>();
                    att.put("attemptNumber", attempt.getAttemptNumber());
                    att.put("status", attempt.getStatus().name());
                    att.put("failureReason", attempt.getFailureReason());
                    att.put("attemptedAt", attempt.getAttemptedAt());
                    return att;
                })
                .collect(Collectors.toList());
            attemptsMap.put("recentAttempts", recentAttemptsList);
            
            long successfulAttempts = attempts.stream().filter(a -> a.getStatus().name().equalsIgnoreCase("SUCCESS")).count();
            long failedAttempts = attempts.stream().filter(a -> a.getStatus().name().equalsIgnoreCase("FAILED")).count();
            attemptsMap.put("successfulAttempts", successfulAttempts);
            attemptsMap.put("failedAttempts", failedAttempts);
        } else {
            attemptsMap.put("totalAttempts", 0);
            attemptsMap.put("attemptCount", 0);
            attemptsMap.put("previousRetryCount", 0);
        }
        context.put("paymentAttempts", attemptsMap);

        // 4. Existing recovery information
        List<RecoveryAction> recoveryActions = transaction.getRecoveryActions();
        Map<String, Object> recoveryMap = new HashMap<>();
        int recoveryActionsCount = 0;
        int successfulRecoveryCount = 0;
        double previousRecoverySuccessRate = 0.0;
        boolean hasEscalation = false;
        
        if (recoveryActions != null && !recoveryActions.isEmpty()) {
            recoveryActionsCount = recoveryActions.size();
            List<Map<String, Object>> recActionsList = recoveryActions.stream()
                .map(action -> {
                    Map<String, Object> act = new HashMap<>();
                    act.put("actionType", action.getActionType().name());
                    act.put("status", action.getStatus().name());
                    act.put("confidence", action.getConfidence());
                    act.put("expectedRecoveryAmount", action.getExpectedRecoveryAmount());
                    act.put("reason", action.getReason());
                    act.put("createdAt", action.getCreatedAt());
                    return act;
                })
                .collect(Collectors.toList());
            recoveryMap.put("actionsList", recActionsList);
            context.put("existingRecoveryActions", recActionsList);
            
            successfulRecoveryCount = (int) recoveryActions.stream()
                .filter(a -> a.getStatus().name().equalsIgnoreCase("SUCCESS") || a.getStatus().name().equalsIgnoreCase("COMPLETED"))
                .count();
            previousRecoverySuccessRate = (double) successfulRecoveryCount / recoveryActionsCount;
            
            hasEscalation = recoveryActions.stream()
                .anyMatch(a -> a.getActionType().name().equalsIgnoreCase("ESCALATE_TO_HUMAN"));
        }
        
        recoveryMap.put("totalRecoveryActions", recoveryActionsCount);
        recoveryMap.put("previousRecoverySuccessRate", previousRecoverySuccessRate);
        recoveryMap.put("hasEscalation", hasEscalation);
        recoveryMap.put("successfulRecoveryCount", successfulRecoveryCount);
        context.put("recoveryHistory", recoveryMap);

        // 5. Risk information
        Map<String, Object> riskMap = new HashMap<>();
        riskMap.put("riskLevel", transaction.getRiskLevel() != null ? transaction.getRiskLevel().name() : "LOW");
        riskMap.put("recoveryPriority", transaction.getRecoveryPriority() != null ? transaction.getRecoveryPriority().name() : "LOW");
        riskMap.put("failureCategory", getFailureCategory(transaction.getFailureReason()));
        context.put("riskInfo", riskMap);

        return context;
    }

    private String sanitizePaymentMethod(String method) {
        if (method == null) return "Unknown";
        return method.replaceAll("\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?(\\d{4})\\b", "•••• •••• •••• $1");
    }

    private String getFailureCategory(com.recoverai.entity.enums.FailureReason reason) {
        if (reason == null) return "UNKNOWN";
        switch (reason) {
            case INSUFFICIENT_FUNDS:
            case NETWORK_ERROR:
            case UNKNOWN:
                return "SOFT_DECLINE";
            case CARD_EXPIRED:
            case AUTHENTICATION_FAILED:
            case LIMIT_EXCEEDED:
                return "CUSTOMER_ACTION_REQUIRED";
            case BANK_DECLINED:
                return "HARD_DECLINE";
            default:
                return "UNKNOWN";
        }
    }
}

package com.recoverai.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recoverai.dto.AIRecoveryDecision;
import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RecoveryActionType;
import com.recoverai.entity.enums.RiskLevel;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class MockAIProvider implements AIProvider {

    @SuppressWarnings("unchecked")
    @Override
    public AIRecoveryDecision generateDecision(Transaction transaction, String recoveryContextJson) {
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> context;
        try {
            context = objectMapper.readValue(recoveryContextJson, Map.class);
        } catch (Exception e) {
            context = new HashMap<>();
        }

        // Extract transaction properties
        Map<String, Object> txnMap = (Map<String, Object>) context.getOrDefault("transaction", new HashMap<>());
        String failureReasonStr = (String) txnMap.get("failureReason");
        FailureReason reason = failureReasonStr != null ? FailureReason.valueOf(failureReasonStr) : null;
        BigDecimal amount = transaction.getAmount();

        // Extract customer properties
        Map<String, Object> custMap = (Map<String, Object>) context.getOrDefault("customer", new HashMap<>());
        int successfulPayments = ((Number) custMap.getOrDefault("successfulPaymentCount", 0)).intValue();
        int failedPayments = ((Number) custMap.getOrDefault("failedPaymentCount", 0)).intValue();
        double successRate = ((Number) custMap.getOrDefault("successRate", 0.0)).doubleValue();

        // Extract attempt properties
        Map<String, Object> attemptsMap = (Map<String, Object>) context.getOrDefault("paymentAttempts", new HashMap<>());
        int totalAttempts = ((Number) attemptsMap.getOrDefault("totalAttempts", 0)).intValue();

        RecoveryActionType action;
        double confidence;
        String decisionReason;
        int retryAfterHours = 0;
        RiskLevel riskLevel = RiskLevel.LOW;

        if (reason == null) {
            action = RecoveryActionType.ESCALATE_TO_HUMAN;
            confidence = 0.50;
            riskLevel = RiskLevel.MEDIUM;
            decisionReason = String.format("Unknown payment decline reason. Escalating to human queue (Customer has %d successful transactions).", successfulPayments);
        } else {
            switch (reason) {
                case INSUFFICIENT_FUNDS:
                    if (totalAttempts <= 2 && successRate >= 0.7) {
                        action = RecoveryActionType.RETRY_PAYMENT;
                        confidence = Math.min(0.95, 0.65 + (successRate * 0.3) - (totalAttempts * 0.05));
                        retryAfterHours = 24;
                        riskLevel = RiskLevel.LOW;
                        decisionReason = String.format("Temporary insufficient funds decline. Customer success rate is %.1f%% with %d previous successes. Recommending auto-retry in 24 hours.", successRate * 100, successfulPayments);
                    } else {
                        action = RecoveryActionType.SEND_REMINDER;
                        confidence = Math.min(0.85, 0.5 + (successRate * 0.3));
                        retryAfterHours = 12;
                        riskLevel = RiskLevel.MEDIUM;
                        decisionReason = String.format("Repeated insufficient funds decline after %d attempts. Recommending reminder notification to update balance.", totalAttempts);
                    }
                    break;

                case CARD_EXPIRED:
                    action = RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE;
                    confidence = Math.min(0.98, 0.7 + (successRate * 0.25));
                    retryAfterHours = 0;
                    riskLevel = RiskLevel.LOW;
                    decisionReason = String.format("The payment instrument is expired while the customer has completed %d successful payments and only %d failed attempts. Requesting a payment-method update has a higher expected recovery probability.", successfulPayments, failedPayments);
                    break;

                case BANK_DECLINED:
                    if (totalAttempts >= 3) {
                        action = RecoveryActionType.STOP_RECOVERY;
                        confidence = 0.90;
                        retryAfterHours = 0;
                        riskLevel = RiskLevel.HIGH;
                        decisionReason = String.format("Persistent bank declines observed across %d attempts. Recommending recovery termination to prevent card block/fees.", totalAttempts);
                    } else {
                        action = RecoveryActionType.ESCALATE_TO_HUMAN;
                        confidence = Math.min(0.80, 0.4 + (successRate * 0.3));
                        retryAfterHours = 0;
                        riskLevel = RiskLevel.HIGH;
                        decisionReason = String.format("Hard bank decline code received. Recommending escalation to support for customer follow-up (Success count: %d).", successfulPayments);
                    }
                    break;

                case NETWORK_ERROR:
                    if (totalAttempts <= 3) {
                        action = RecoveryActionType.RETRY_PAYMENT;
                        confidence = Math.min(0.98, 0.8 + (successRate * 0.15));
                        retryAfterHours = 1;
                        riskLevel = RiskLevel.LOW;
                        decisionReason = String.format("Transient gateway network failure. Strong success rate of %.1f%% suggests immediate auto-retry will succeed.", successRate * 100);
                    } else {
                        action = RecoveryActionType.ESCALATE_TO_HUMAN;
                        confidence = 0.60;
                        retryAfterHours = 0;
                        riskLevel = RiskLevel.MEDIUM;
                        decisionReason = String.format("Repeated network issues across %d attempts. Escalating to engineering/support queue.", totalAttempts);
                    }
                    break;

                case AUTHENTICATION_FAILED:
                    action = RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE;
                    confidence = Math.min(0.90, 0.6 + (successRate * 0.2));
                    retryAfterHours = 0;
                    riskLevel = RiskLevel.LOW;
                    decisionReason = String.format("Customer authentication/OTP verification failed. Recommending prompt to retry checkout or update details (Customer successes: %d).", successfulPayments);
                    break;

                case LIMIT_EXCEEDED:
                    action = RecoveryActionType.SEND_PAYMENT_LINK;
                    confidence = Math.min(0.95, 0.7 + (successRate * 0.2));
                    retryAfterHours = 0;
                    riskLevel = RiskLevel.LOW;
                    decisionReason = String.format("Standard payment limit exceeded. Sending direct alternative checkout payment link (Customer successes: %d).", successfulPayments);
                    break;

                default:
                    action = RecoveryActionType.ESCALATE_TO_HUMAN;
                    confidence = 0.50;
                    retryAfterHours = 0;
                    riskLevel = RiskLevel.MEDIUM;
                    decisionReason = String.format("Generic decline code. Escalating to human queue (Customer has %d successful transactions).", successfulPayments);
                    break;
            }
        }

        BigDecimal expectedAmount = amount.multiply(BigDecimal.valueOf(confidence))
            .setScale(2, RoundingMode.HALF_UP);

        return AIRecoveryDecision.builder()
            .action(action)
            .confidence(confidence)
            .reason(decisionReason)
            .expectedRecoveryAmount(expectedAmount)
            .retryAfterHours(retryAfterHours)
            .riskLevel(riskLevel)
            .decisionId(UUID.randomUUID().toString())
            .transactionId(transaction.getTransactionId())
            .generatedAt(Instant.now())
            .build();
    }
}

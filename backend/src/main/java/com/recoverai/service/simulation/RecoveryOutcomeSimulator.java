package com.recoverai.service.simulation;

import com.recoverai.entity.Customer;
import com.recoverai.entity.PaymentAttempt;
import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RecoveryActionType;
import com.recoverai.entity.enums.TransactionStatus;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Deterministic Recovery Outcome Model.
 * Evaluates the outcome of a recovery action against a transaction context
 * using deterministic hashing (no Math.random()).
 * Ensures 100% reproducible benchmark comparisons across runs.
 */
@Service
public class RecoveryOutcomeSimulator {

    @Data
    @Builder
    public static class OutcomeResult {
        private boolean success;
        private BigDecimal recoveredAmount;
        private TransactionStatus resultingStatus;
        private int attemptsCount;
        private String explanation;
    }

    /**
     * Deterministically evaluates the recovery outcome for a transaction and an action.
     */
    public OutcomeResult evaluateOutcome(Transaction transaction, RecoveryActionType action) {
        if (transaction == null || action == null) {
            return OutcomeResult.builder()
                    .success(false)
                    .recoveredAmount(BigDecimal.ZERO)
                    .resultingStatus(TransactionStatus.FAILED)
                    .attemptsCount(0)
                    .explanation("Invalid transaction or action")
                    .build();
        }

        // 1. If transaction is already recovered or stopped
        if (transaction.getStatus() == TransactionStatus.RECOVERED) {
            return OutcomeResult.builder()
                    .success(true)
                    .recoveredAmount(transaction.getAmount())
                    .resultingStatus(TransactionStatus.RECOVERED)
                    .attemptsCount(getAttemptCount(transaction))
                    .explanation("Transaction was already successfully recovered.")
                    .build();
        }

        if (action == RecoveryActionType.STOP_RECOVERY) {
            return OutcomeResult.builder()
                    .success(false)
                    .recoveredAmount(BigDecimal.ZERO)
                    .resultingStatus(TransactionStatus.STOPPED)
                    .attemptsCount(getAttemptCount(transaction))
                    .explanation("Recovery action stopped per policy.")
                    .build();
        }

        if (action == RecoveryActionType.ESCALATE_TO_HUMAN) {
            // Human escalation resolution rate ~45% deterministically
            int seed = computeDeterministicSeed(transaction.getTransactionId(), "HUMAN_ESCALATION");
            boolean resolved = seed < 45;
            return OutcomeResult.builder()
                    .success(resolved)
                    .recoveredAmount(resolved ? transaction.getAmount() : BigDecimal.ZERO)
                    .resultingStatus(resolved ? TransactionStatus.RECOVERED : TransactionStatus.ESCALATED)
                    .attemptsCount(getAttemptCount(transaction) + 1)
                    .explanation(resolved ? "VIP Human agent successfully assisted customer with payment." : "Escalated to human support queue.")
                    .build();
        }

        // 2. Compute deterministic seed (0 - 99) for this transaction + action
        int seed = computeDeterministicSeed(transaction.getTransactionId(), action.name());

        // 3. Compute contextual probability (0 - 100)
        int probability = calculateSuccessProbability(transaction, action);

        boolean isSuccess = seed < probability;
        int nextAttempts = getAttemptCount(transaction) + 1;

        TransactionStatus resultingStatus;
        if (isSuccess) {
            resultingStatus = TransactionStatus.RECOVERED;
        } else if (action == RecoveryActionType.RETRY_PAYMENT) {
            resultingStatus = TransactionStatus.FAILED;
        } else {
            resultingStatus = TransactionStatus.RECOVERING;
        }

        BigDecimal recoveredAmount = isSuccess ? transaction.getAmount() : BigDecimal.ZERO;

        return OutcomeResult.builder()
                .success(isSuccess)
                .recoveredAmount(recoveredAmount)
                .resultingStatus(resultingStatus)
                .attemptsCount(nextAttempts)
                .explanation(String.format("Action %s yielded outcome %s (Probability: %d%%, Deterministic Hash Score: %d)",
                        action, isSuccess ? "SUCCESS" : "UNSUCCESSFUL", probability, seed))
                .build();
    }

    private int calculateSuccessProbability(Transaction transaction, RecoveryActionType action) {
        FailureReason reason = transaction.getFailureReason();
        Customer customer = transaction.getCustomer();
        int attempts = getAttemptCount(transaction);

        double customerReliability = 0.5;
        if (customer != null) {
            int successCount = customer.getSuccessfulPaymentCount() != null ? customer.getSuccessfulPaymentCount() : 0;
            int failedCount = customer.getFailedPaymentCount() != null ? customer.getFailedPaymentCount() : 0;
            int total = successCount + failedCount;
            if (total > 0) {
                customerReliability = (double) successCount / total;
            }
        }

        int baseProbability = 50;

        if (reason == null) {
            return baseProbability;
        }

        switch (reason) {
            case INSUFFICIENT_FUNDS:
                if (action == RecoveryActionType.RETRY_PAYMENT) {
                    baseProbability = 70;
                    if (customerReliability >= 0.75) baseProbability += 15;
                    if (attempts >= 2) baseProbability -= 25;
                } else if (action == RecoveryActionType.SEND_PAYMENT_LINK || action == RecoveryActionType.SEND_REMINDER) {
                    baseProbability = 55;
                    if (customerReliability >= 0.70) baseProbability += 15;
                } else {
                    baseProbability = 30;
                }
                break;

            case CARD_EXPIRED:
                if (action == RecoveryActionType.RETRY_PAYMENT) {
                    // Blind retries on expired cards always fail!
                    baseProbability = 0;
                } else if (action == RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE) {
                    baseProbability = 78;
                    if (customerReliability >= 0.60) baseProbability += 12;
                } else if (action == RecoveryActionType.SEND_PAYMENT_LINK) {
                    baseProbability = 60;
                } else {
                    baseProbability = 20;
                }
                break;

            case AUTHENTICATION_FAILED:
                if (action == RecoveryActionType.RETRY_PAYMENT) {
                    // 3DS OTP drop retry without customer interaction has low probability
                    baseProbability = 22;
                } else if (action == RecoveryActionType.SEND_PAYMENT_LINK || action == RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE) {
                    baseProbability = 80;
                    if (customerReliability >= 0.70) baseProbability += 10;
                } else {
                    baseProbability = 45;
                }
                break;

            case LIMIT_EXCEEDED:
                if (action == RecoveryActionType.RETRY_PAYMENT) {
                    baseProbability = 25;
                } else if (action == RecoveryActionType.SEND_PAYMENT_LINK) {
                    baseProbability = 72;
                } else if (action == RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE) {
                    baseProbability = 65;
                } else {
                    baseProbability = 40;
                }
                break;

            case NETWORK_ERROR:
                if (action == RecoveryActionType.RETRY_PAYMENT) {
                    if (attempts == 0) baseProbability = 88;
                    else if (attempts == 1) baseProbability = 50;
                    else baseProbability = 15;
                } else {
                    baseProbability = 40;
                }
                break;

            case BANK_DECLINED:
                if (action == RecoveryActionType.RETRY_PAYMENT) {
                    // Bank declined hard stop
                    baseProbability = 6;
                } else if (action == RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE) {
                    baseProbability = 64;
                } else if (action == RecoveryActionType.ESCALATE_TO_HUMAN) {
                    baseProbability = 50;
                } else {
                    baseProbability = 25;
                }
                break;

            case UNKNOWN:
            default:
                if (action == RecoveryActionType.RETRY_PAYMENT) {
                    baseProbability = 35;
                } else {
                    baseProbability = 50;
                }
                break;
        }

        // Clamp between 0 and 98
        return Math.max(0, Math.min(98, baseProbability));
    }

    private int getAttemptCount(Transaction transaction) {
        List<PaymentAttempt> attempts = transaction.getPaymentAttempts();
        return attempts != null ? attempts.size() : 0;
    }

    private int computeDeterministicSeed(String txnId, String salt) {
        String key = (txnId != null ? txnId : "TXN") + ":" + (salt != null ? salt : "");
        int hash = key.hashCode();
        return Math.abs(hash % 100);
    }
}

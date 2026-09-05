package com.recoverai.service.simulation;

import com.recoverai.entity.PaymentAttempt;
import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.RecoveryActionType;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Traditional / Baseline Recovery Strategy.
 * Represents a standard non-intelligent payment recovery dunning system:
 * - Fixed retry policy (blind RETRY_PAYMENT up to 2 attempts)
 * - No failure-code specific routing (blindly retries expired cards or bank declines)
 * - No customer-LTV or reliability awareness
 * - Halts after 2 fixed retries.
 */
@Service
public class BaselineRecoveryStrategy {

    public static final int BASELINE_MAX_RETRIES = 2;

    public RecoveryActionType determineBaselineAction(Transaction transaction) {
        if (transaction == null) {
            return RecoveryActionType.STOP_RECOVERY;
        }

        List<PaymentAttempt> attempts = transaction.getPaymentAttempts();
        int attemptCount = attempts != null ? attempts.size() : 0;

        if (attemptCount < BASELINE_MAX_RETRIES) {
            // Traditional baseline simply retries every failed transaction blindly
            return RecoveryActionType.RETRY_PAYMENT;
        } else {
            // After 2 retries, traditional policy halts
            return RecoveryActionType.STOP_RECOVERY;
        }
    }
}

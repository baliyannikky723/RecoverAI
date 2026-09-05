package com.recoverai.service.guardrail;

import com.recoverai.dto.AIRecoveryDecision;
import com.recoverai.entity.AuditLog;
import com.recoverai.entity.PaymentAttempt;
import com.recoverai.entity.RecoveryAction;
import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RecoveryActionType;
import com.recoverai.entity.enums.RiskLevel;
import com.recoverai.entity.enums.TransactionStatus;
import com.recoverai.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Deterministic Guardrail & Policy Engine for RecoverAI.
 * Validates, enforces business constraints, and overrides raw AI recommendations
 * before any recovery strategy can be approved or executed.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecoveryGuardrailService {

    public static final int MAX_RETRY_ATTEMPTS = 3;
    public static final double MIN_RETRY_CONFIDENCE_THRESHOLD = 0.55;
    public static final BigDecimal HIGH_VALUE_TRANSACTION_THRESHOLD = BigDecimal.valueOf(50000);

    private final AuditLogRepository auditLogRepository;

    /**
     * Applies deterministic policy guardrails to an AI decision.
     * The LLM recommendation is NOT authoritative; this method has final authority.
     */
    public AIRecoveryDecision applyGuardrails(Transaction transaction, AIRecoveryDecision rawDecision) {
        if (transaction == null || rawDecision == null) {
            throw new IllegalArgumentException("Transaction and raw decision must not be null");
        }

        RecoveryActionType originalAction = rawDecision.getAction();
        Double originalConfidence = rawDecision.getConfidence();
        String originalReason = rawDecision.getReason();

        RecoveryActionType finalAction = originalAction;
        String overrideReason = null;

        List<PaymentAttempt> attempts = transaction.getPaymentAttempts();
        int attemptCount = attempts != null ? attempts.size() : 0;
        FailureReason failureReason = transaction.getFailureReason();
        TransactionStatus status = transaction.getStatus();
        RiskLevel riskLevel = transaction.getRiskLevel();
        BigDecimal amount = transaction.getAmount();

        // 1. Transaction state protection: Cannot retry already recovered or stopped transactions
        if (status == TransactionStatus.RECOVERED) {
            finalAction = RecoveryActionType.STOP_RECOVERY;
            overrideReason = "Transaction is already in RECOVERED status. Further recovery actions blocked.";
        } else if (status == TransactionStatus.STOPPED) {
            finalAction = RecoveryActionType.STOP_RECOVERY;
            overrideReason = "Transaction recovery was previously marked STOPPED.";
        }

        // 2. Maximum retry attempts protection
        else if (originalAction == RecoveryActionType.RETRY_PAYMENT && attemptCount >= MAX_RETRY_ATTEMPTS) {
            if (amount != null && amount.compareTo(HIGH_VALUE_TRANSACTION_THRESHOLD) >= 0) {
                finalAction = RecoveryActionType.ESCALATE_TO_HUMAN;
                overrideReason = String.format("MAX_RETRY_ATTEMPTS exceeded (%d attempts). High-value transaction escalated to VIP queue.", attemptCount);
            } else {
                finalAction = RecoveryActionType.STOP_RECOVERY;
                overrideReason = String.format("MAX_RETRY_ATTEMPTS exceeded (%d attempts). Halting automated retries.", attemptCount);
            }
        }

        // 3. Hard-decline protection: Never blindly retry bank declined cards
        else if (originalAction == RecoveryActionType.RETRY_PAYMENT && failureReason == FailureReason.BANK_DECLINED) {
            finalAction = RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE;
            overrideReason = "HARD_DECLINE protection: Bank declined card cannot be retried. Requesting customer to update payment method.";
        }

        // 4. Expired card protection: Retry will always fail on expired cards
        else if (originalAction == RecoveryActionType.RETRY_PAYMENT && failureReason == FailureReason.CARD_EXPIRED) {
            finalAction = RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE;
            overrideReason = "CARD_EXPIRED protection: Card is expired. Replaced retry with payment method update request.";
        }

        // 5. 3DS Authentication Failure protection: Requires customer action
        else if (originalAction == RecoveryActionType.RETRY_PAYMENT && failureReason == FailureReason.AUTHENTICATION_FAILED) {
            finalAction = RecoveryActionType.SEND_PAYMENT_LINK;
            overrideReason = "AUTHENTICATION_FAILED protection: 3DS/OTP drop requires active customer payment link.";
        }

        // 6. Confidence threshold protection for automated retries
        else if (originalAction == RecoveryActionType.RETRY_PAYMENT && (originalConfidence == null || originalConfidence < MIN_RETRY_CONFIDENCE_THRESHOLD)) {
            finalAction = RecoveryActionType.ESCALATE_TO_HUMAN;
            overrideReason = String.format("CONFIDENCE_TOO_LOW: AI confidence (%.0f%%) below minimum retry threshold (%.0f%%). Escalating to human.",
                    (originalConfidence != null ? originalConfidence * 100 : 0), MIN_RETRY_CONFIDENCE_THRESHOLD * 100);
        }

        // 7. Duplicate recovery action protection
        else if (hasConsecutiveDuplicateAction(transaction, originalAction)) {
            if (originalAction == RecoveryActionType.SEND_PAYMENT_LINK || originalAction == RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE) {
                finalAction = RecoveryActionType.SEND_REMINDER;
                overrideReason = "DUPLICATE_ACTION protection: Payment link/update already sent. Switching to gentle reminder.";
            } else if (originalAction == RecoveryActionType.SEND_REMINDER) {
                finalAction = RecoveryActionType.ESCALATE_TO_HUMAN;
                overrideReason = "REPEATED_REMINDERS protection: Repeated reminders sent without response. Escalating to support.";
            }
        }

        // 8. High-Risk / High-Value protection
        else if (riskLevel == RiskLevel.HIGH && amount != null && amount.compareTo(HIGH_VALUE_TRANSACTION_THRESHOLD) >= 0 && originalAction == RecoveryActionType.STOP_RECOVERY) {
            finalAction = RecoveryActionType.ESCALATE_TO_HUMAN;
            overrideReason = "HIGH_VALUE_PROTECTION: High-value high-risk transaction cannot be silently stopped. Escalated to account manager.";
        }

        boolean wasOverridden = overrideReason != null;
        String finalReason = wasOverridden
                ? "[Guardrail Enforced: " + overrideReason + "] (Original AI was " + originalAction + ": " + originalReason + ")"
                : originalReason;

        AIRecoveryDecision validatedDecision = AIRecoveryDecision.builder()
                .action(finalAction)
                .confidence(rawDecision.getConfidence())
                .reason(finalReason)
                .expectedRecoveryAmount(rawDecision.getExpectedRecoveryAmount())
                .retryAfterHours(rawDecision.getRetryAfterHours())
                .riskLevel(rawDecision.getRiskLevel())
                .decisionId(rawDecision.getDecisionId() != null ? rawDecision.getDecisionId() : UUID.randomUUID().toString())
                .transactionId(rawDecision.getTransactionId())
                .generatedAt(rawDecision.getGeneratedAt() != null ? rawDecision.getGeneratedAt() : Instant.now())
                .guardrailRejected(wasOverridden)
                .build();

        // Record audit trail event for Guardrail validation
        recordGuardrailAudit(transaction, rawDecision, validatedDecision, wasOverridden, overrideReason);

        return validatedDecision;
    }

    private boolean hasConsecutiveDuplicateAction(Transaction transaction, RecoveryActionType actionType) {
        List<RecoveryAction> actions = transaction.getRecoveryActions();
        if (actions == null || actions.size() < 2) return false;
        
        // Check if the last 2 actions were the same action type
        int sameCount = 0;
        for (int i = 0; i < Math.min(actions.size(), 2); i++) {
            if (actions.get(i).getActionType() == actionType) {
                sameCount++;
            }
        }
        return sameCount >= 2;
    }

    private void recordGuardrailAudit(
            Transaction transaction,
            AIRecoveryDecision rawDecision,
            AIRecoveryDecision validatedDecision,
            boolean wasOverridden,
            String overrideReason
    ) {
        String eventType = wasOverridden ? "AI_DECISION_REJECTED_BY_GUARDRAIL" : "AI_DECISION_VALIDATED";
        String result = wasOverridden ? "OVERRIDDEN" : "APPROVED";
        String actionStr = validatedDecision.getAction().name();
        String reasonStr = wasOverridden ? overrideReason : "AI recommendation satisfies all business and risk guardrails";

        AuditLog auditLog = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .transaction(transaction)
                .eventType(eventType)
                .actor("GUARDRAIL_ENGINE")
                .decision(actionStr)
                .action(wasOverridden ? "Overrode " + rawDecision.getAction() + " -> " + actionStr : "Approved " + actionStr)
                .result(result)
                .reason(reasonStr)
                .confidence(validatedDecision.getConfidence())
                .expectedRecoveryAmount(validatedDecision.getExpectedRecoveryAmount())
                .retryAfterHours(validatedDecision.getRetryAfterHours())
                .riskLevel(validatedDecision.getRiskLevel() != null ? validatedDecision.getRiskLevel().name() : null)
                .provider("RecoveryGuardrailService")
                .timestamp(Instant.now())
                .build();

        auditLogRepository.save(auditLog);
    }
}

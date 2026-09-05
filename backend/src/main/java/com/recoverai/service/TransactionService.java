package com.recoverai.service;

import com.recoverai.dto.*;
import com.recoverai.entity.*;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RiskLevel;
import com.recoverai.entity.enums.TransactionStatus;
import com.recoverai.exception.ResourceNotFoundException;
import com.recoverai.repository.*;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final RecoveryActionRepository recoveryActionRepository;
    private final AuditLogRepository auditLogRepository;
    private final CustomerRepository customerRepository;
    private final CustomerService customerService;
    private final com.recoverai.service.guardrail.RecoveryGuardrailService guardrailService;
    private final com.recoverai.service.simulation.RecoveryOutcomeSimulator outcomeSimulator;
    @org.springframework.context.annotation.Lazy @org.springframework.beans.factory.annotation.Autowired private com.recoverai.service.ai.AIRecoveryService aiRecoveryService;

    @Transactional(readOnly = true)
    public PageResponse<TransactionSummaryDto> getTransactions(
            String search,
            TransactionStatus status,
            RiskLevel risk,
            FailureReason failureReason,
            Pageable pageable
    ) {
        Specification<Transaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (risk != null) {
                predicates.add(cb.equal(root.get("riskLevel"), risk));
            }
            if (failureReason != null) {
                predicates.add(cb.equal(root.get("failureReason"), failureReason));
            }
            if (search != null && !search.trim().isEmpty()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate txnIdMatch = cb.like(cb.lower(root.get("transactionId")), term);
                Predicate custNameMatch = cb.like(cb.lower(root.join("customer").get("name")), term);
                Predicate custEmailMatch = cb.like(cb.lower(root.join("customer").get("email")), term);
                Predicate methodMatch = cb.like(cb.lower(root.get("paymentMethod")), term);
                predicates.add(cb.or(txnIdMatch, custNameMatch, custEmailMatch, methodMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Transaction> page = transactionRepository.findAll(spec, pageable);
        List<TransactionSummaryDto> dtos = page.getContent().stream()
                .map(this::mapToSummaryDto)
                .toList();

        return PageResponse.<TransactionSummaryDto>builder()
                .content(dtos)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public TransactionDetailDto getTransactionById(String id) {
        Transaction transaction = transactionRepository.findById(id)
                .or(() -> transactionRepository.findByTransactionId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        List<PaymentAttempt> attempts = paymentAttemptRepository.findByTransactionIdOrderByAttemptNumberAsc(transaction.getId());
        List<RecoveryAction> recoveryActions = recoveryActionRepository.findByTransactionIdOrderByCreatedAtDesc(transaction.getId());
        List<AuditLog> auditLogs = auditLogRepository.findByTransactionIdOrderByTimestampDesc(transaction.getId());

        return TransactionDetailDto.builder()
                .id(transaction.getId())
                .transactionId(transaction.getTransactionId())
                .customer(customerService.mapToCustomerSummary(transaction.getCustomer()))
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .paymentMethod(transaction.getPaymentMethod())
                .status(transaction.getStatus())
                .failureReason(transaction.getFailureReason())
                .riskLevel(transaction.getRiskLevel())
                .recoveryPriority(transaction.getRecoveryPriority())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .paymentAttempts(attempts.stream().map(this::mapToPaymentAttemptDto).toList())
                .recoveryActions(recoveryActions.stream().map(this::mapToRecoveryActionDto).toList())
                .auditLogs(auditLogs.stream().map(this::mapToAuditLogDto).toList())
                .build();
    }

    public TransactionSummaryDto mapToSummaryDto(Transaction t) {
        boolean hasPending = t.getRecoveryActions() != null && t.getRecoveryActions().stream()
                .anyMatch(a -> a.getStatus() == com.recoverai.entity.enums.RecoveryActionStatus.PENDING);

        return TransactionSummaryDto.builder()
                .id(t.getId())
                .transactionId(t.getTransactionId())
                .customerId(t.getCustomer().getId())
                .customerName(t.getCustomer().getName())
                .customerEmail(t.getCustomer().getEmail())
                .amount(t.getAmount())
                .currency(t.getCurrency())
                .paymentMethod(t.getPaymentMethod())
                .status(t.getStatus())
                .failureReason(t.getFailureReason())
                .riskLevel(t.getRiskLevel())
                .recoveryPriority(t.getRecoveryPriority())
                .aiReviewReady(hasPending)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private PaymentAttemptDto mapToPaymentAttemptDto(PaymentAttempt pa) {
        return PaymentAttemptDto.builder()
                .id(pa.getId())
                .attemptNumber(pa.getAttemptNumber())
                .status(pa.getStatus())
                .failureReason(pa.getFailureReason())
                .attemptedAt(pa.getAttemptedAt())
                .build();
    }

    private RecoveryActionDto mapToRecoveryActionDto(RecoveryAction ra) {
        return RecoveryActionDto.builder()
                .id(ra.getId())
                .transactionId(ra.getTransaction().getTransactionId())
                .customerName(ra.getTransaction().getCustomer().getName())
                .amount(ra.getTransaction().getAmount())
                .currency(ra.getTransaction().getCurrency())
                .actionType(ra.getActionType())
                .confidence(ra.getConfidence())
                .expectedRecoveryAmount(ra.getExpectedRecoveryAmount())
                .status(ra.getStatus())
                .reason(ra.getReason())
                .createdAt(ra.getCreatedAt())
                .executedAt(ra.getExecutedAt())
                .build();
    }

    private AuditLogDto mapToAuditLogDto(AuditLog al) {
        return AuditLogDto.builder()
                .id(al.getId())
                .transactionId(al.getTransaction() != null ? al.getTransaction().getTransactionId() : null)
                .eventType(al.getEventType())
                .actor(al.getActor())
                .decision(al.getDecision())
                .action(al.getAction())
                .result(al.getResult())
                .reason(al.getReason())
                .timestamp(al.getTimestamp())
                .build();
    }

    @Transactional
    public TransactionDetailDto executeStrategy(String id, com.recoverai.dto.AIRecoveryDecision rawDecision) {
        Transaction transaction = transactionRepository.findById(id)
                .or(() -> transactionRepository.findByTransactionId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        // Validate that this AI decision was generated for THIS transaction
        if (rawDecision.getTransactionId() != null && !rawDecision.getTransactionId().equals(transaction.getTransactionId())) {
            throw new IllegalArgumentException("Mismatched AI Decision: This strategy was generated for a different transaction.");
        }

        // 1. Enforce Guardrail Policy before execution (Deterministic policy has final authority)
        com.recoverai.dto.AIRecoveryDecision decision = guardrailService.applyGuardrails(transaction, rawDecision);

        TransactionStatus previousStatus = transaction.getStatus();
        java.time.Instant now = java.time.Instant.now();

        // 2. Evaluate simulated/controlled recovery outcome
        com.recoverai.service.simulation.RecoveryOutcomeSimulator.OutcomeResult outcome = 
                outcomeSimulator.evaluateOutcome(transaction, decision.getAction());

        TransactionStatus newStatus = outcome.getResultingStatus();
        java.math.BigDecimal actualRecoveredAmount = outcome.getRecoveredAmount();
        boolean isSuccess = outcome.isSuccess();

        // 3. Create and save the RecoveryAction (preserving AI expected prediction distinct from actual outcome)
        RecoveryAction recoveryAction = RecoveryAction.builder()
                .id(UUID.randomUUID().toString())
                .transaction(transaction)
                .actionType(decision.getAction())
                .confidence(decision.getConfidence())
                .expectedRecoveryAmount(decision.getExpectedRecoveryAmount())
                .status(isSuccess ? com.recoverai.entity.enums.RecoveryActionStatus.EXECUTED : com.recoverai.entity.enums.RecoveryActionStatus.FAILED)
                .reason(decision.getReason() + " | Outcome: " + outcome.getExplanation())
                .createdAt(now)
                .executedAt(now)
                .build();
        recoveryActionRepository.save(recoveryAction);

        // 4. Update Payment Attempts and Customer stats based on action
        if (decision.getAction() == com.recoverai.entity.enums.RecoveryActionType.RETRY_PAYMENT) {
            com.recoverai.entity.enums.PaymentAttemptStatus attemptStatus = isSuccess
                    ? com.recoverai.entity.enums.PaymentAttemptStatus.SUCCESS
                    : com.recoverai.entity.enums.PaymentAttemptStatus.FAILED;

            List<PaymentAttempt> existingAttempts = paymentAttemptRepository.findByTransactionIdOrderByAttemptNumberAsc(transaction.getId());
            int nextAttemptNum = existingAttempts.size() + 1;

            PaymentAttempt attempt = PaymentAttempt.builder()
                    .id(UUID.randomUUID().toString())
                    .transaction(transaction)
                    .attemptNumber(nextAttemptNum)
                    .status(attemptStatus)
                    .failureReason(isSuccess ? null : (transaction.getFailureReason() != null ? transaction.getFailureReason().name() : "DECLINED"))
                    .attemptedAt(now)
                    .build();
            paymentAttemptRepository.save(attempt);

            Customer customer = transaction.getCustomer();
            if (customer != null) {
                if (isSuccess) {
                    customer.setSuccessfulPaymentCount(customer.getSuccessfulPaymentCount() + 1);
                } else {
                    customer.setFailedPaymentCount(customer.getFailedPaymentCount() + 1);
                }
                customerRepository.save(customer);
            }
        } else if (decision.getAction() == com.recoverai.entity.enums.RecoveryActionType.SEND_PAYMENT_LINK) {
            List<PaymentAttempt> existingAttempts = paymentAttemptRepository.findByTransactionIdOrderByAttemptNumberAsc(transaction.getId());
            int nextAttemptNum = existingAttempts.size() + 1;

            PaymentAttempt attempt = PaymentAttempt.builder()
                    .id(UUID.randomUUID().toString())
                    .transaction(transaction)
                    .attemptNumber(nextAttemptNum)
                    .status(isSuccess ? com.recoverai.entity.enums.PaymentAttemptStatus.SUCCESS : com.recoverai.entity.enums.PaymentAttemptStatus.PENDING)
                    .failureReason(isSuccess ? null : "Payment link dispatched to customer")
                    .attemptedAt(now)
                    .build();
            paymentAttemptRepository.save(attempt);

            if (isSuccess) {
                Customer customer = transaction.getCustomer();
                if (customer != null) {
                    customer.setSuccessfulPaymentCount(customer.getSuccessfulPaymentCount() + 1);
                    customerRepository.save(customer);
                }
            }
        }

        // 5. Save updated transaction status
        transaction.setStatus(newStatus);
        transaction.setUpdatedAt(now);
        transactionRepository.save(transaction);

        // 6. Record comprehensive lifecycle event in audit logs
        String eventType = "RECOVERY_ACTION_EXECUTED";
        if (newStatus == TransactionStatus.RECOVERED) {
            eventType = "RECOVERY_SUCCEEDED";
        } else if (newStatus == TransactionStatus.FAILED) {
            eventType = "RECOVERY_FAILED";
        } else if (newStatus == TransactionStatus.ESCALATED) {
            eventType = "HUMAN_ESCALATION";
        } else if (newStatus == TransactionStatus.STOPPED) {
            eventType = "RECOVERY_STOPPED";
        }

        AuditLog auditLog = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .transaction(transaction)
                .eventType(eventType)
                .actor("SYSTEM")
                .decision(decision.getAction().name())
                .action("Executed strategy: " + decision.getAction().name())
                .result(newStatus.name())
                .reason(String.format("Previous State: %s -> New State: %s | Recovered Amount: ₹%s | Expected: ₹%s | %s",
                        previousStatus, newStatus, actualRecoveredAmount.toPlainString(),
                        decision.getExpectedRecoveryAmount() != null ? decision.getExpectedRecoveryAmount().toPlainString() : "0.00",
                        outcome.getExplanation()))
                .confidence(decision.getConfidence())
                .expectedRecoveryAmount(decision.getExpectedRecoveryAmount())
                .retryAfterHours(decision.getRetryAfterHours())
                .riskLevel(decision.getRiskLevel() != null ? decision.getRiskLevel().name() : null)
                .provider("RecoverAI-Execution-Engine")
                .timestamp(now)
                .build();
        auditLogRepository.save(auditLog);

        return getTransactionById(transaction.getId());
    }
    @Transactional
    public String handlePaymentFailedWebhook(RazorpayWebhookPayload payload) {
        String paymentId = payload.getPayload().getPayment().getEntity().getId();
        
        // Find existing transaction by transactionId matching the paymentId
        Transaction transaction = transactionRepository.findByTransactionId(paymentId).orElse(null);
        
        if (transaction != null) {
            // Idempotency check: If already processed and RECOVERING, don't trigger AI again
            if (transaction.getStatus() == TransactionStatus.RECOVERING) {
                return transaction.getTransactionId();
            }
            
            // Check if there's already a PENDING action
            boolean hasPending = transaction.getRecoveryActions().stream()
                    .anyMatch(a -> a.getStatus() == com.recoverai.entity.enums.RecoveryActionStatus.PENDING);
            if (hasPending) {
                return transaction.getTransactionId();
            }
        } else {
            // Demo mapping: For this simulation, if we receive a webhook for a payment ID we don't know,
            // we look for the first existing customer, and create a FAILED transaction for them.
            // If the user provided a known TXN ID in the webhook payload, it would have been found above.
            Customer customer = customerRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No customers found for demo seeding"));
            
            transaction = Transaction.builder()
                    .id(UUID.randomUUID().toString())
                    .transactionId(paymentId)
                    .customer(customer)
                    .amount(payload.getPayload().getPayment().getEntity().getAmount().divide(java.math.BigDecimal.valueOf(100))) // Razorpay amounts are in paise
                    .currency(payload.getPayload().getPayment().getEntity().getCurrency())
                    .paymentMethod("Card (Webhook Demo)")
                    .status(TransactionStatus.FAILED)
                    .failureReason(FailureReason.valueOf(
                        payload.getPayload().getPayment().getEntity().getErrorCode() != null 
                            ? (payload.getPayload().getPayment().getEntity().getErrorCode().contains("NETWORK") ? "NETWORK_ERROR" : "INSUFFICIENT_FUNDS") 
                            : "INSUFFICIENT_FUNDS"
                    ))
                    .riskLevel(RiskLevel.MEDIUM)
                    .recoveryPriority(com.recoverai.entity.enums.RecoveryPriority.HIGH)
                    .build();
            transactionRepository.save(transaction);
            
            AuditLog auditLog = AuditLog.builder()
                    .id(UUID.randomUUID().toString())
                    .transaction(transaction)
                    .eventType("WEBHOOK_RECEIVED")
                    .actor("SYSTEM")
                    .decision("Flagged At-Risk")
                    .action("Captured webhook failure")
                    .result("FAILED")
                    .reason(payload.getPayload().getPayment().getEntity().getErrorDescription())
                    .timestamp(java.time.Instant.now())
                    .build();
            auditLogRepository.save(auditLog);
        }

        // Trigger the AI analysis pipeline
        aiRecoveryService.generateAndPersistDecision(transaction.getTransactionId());
        
        return transaction.getTransactionId();
    }
}

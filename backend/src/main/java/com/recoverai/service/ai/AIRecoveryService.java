package com.recoverai.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recoverai.dto.AIRecoveryDecision;
import com.recoverai.entity.AuditLog;
import com.recoverai.entity.Transaction;
import com.recoverai.exception.ResourceNotFoundException;
import com.recoverai.repository.AuditLogRepository;
import com.recoverai.repository.TransactionRepository;
import com.recoverai.service.guardrail.RecoveryGuardrailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIRecoveryService {

    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final RecoveryContextBuilder contextBuilder;
    private final RecoveryGuardrailService guardrailService;
    private final AIProvider aiProvider;
    private final ObjectMapper objectMapper;

    @Transactional
    public AIRecoveryDecision generateDecision(String transactionId) {
        long startTime = System.currentTimeMillis();
        log.info("AI Service: Starting decision generation for transaction ID: {}", transactionId);

        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + transactionId));

        AIRecoveryDecision rawDecision = null;
        String providerName = aiProvider.getClass().getSimpleName();
        String contextJson = "";
        try {
            // 1. Build context
            Map<String, Object> contextMap = contextBuilder.buildContext(transaction);
            contextJson = objectMapper.writeValueAsString(contextMap);

            final String finalContextJson = contextJson;
            // 2. Call AI Provider with a 15-second timeout to prevent frontend hanging
            java.util.concurrent.CompletableFuture<AIRecoveryDecision> future = java.util.concurrent.CompletableFuture.supplyAsync(() -> 
                aiProvider.generateDecision(transaction, finalContextJson)
            );
            
            rawDecision = future.get(15, java.util.concurrent.TimeUnit.SECONDS);

            // 3. Validate structural properties
            validateDecision(rawDecision);

            // 4. Record successful generation audit event
            recordAuditEvent(transaction, rawDecision, "SUCCESS", providerName);

            long duration = System.currentTimeMillis() - startTime;
            log.info("AI Service: Successfully generated decision using {} in {}ms. Raw Action: {}, Confidence: {}",
                providerName, duration, rawDecision.getAction(), rawDecision.getConfidence());

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.warn("AI Service: Real LLM generation failed using {} in {}ms (Error: {}). Falling back to local MockAIProvider.", 
                providerName, duration, e.getMessage());
            
            // Record failed audit event for the primary provider
            recordFailedAuditEvent(transaction, e.getMessage(), providerName);

            try {
                // Instantiating MockAIProvider as fallback
                MockAIProvider fallbackProvider = new MockAIProvider();
                rawDecision = fallbackProvider.generateDecision(transaction, contextJson);

                // Validate structural properties
                validateDecision(rawDecision);

                // Record fallback success audit event
                recordAuditEvent(transaction, rawDecision, "FALLBACK_SUCCESS", "MockAIProvider");

                log.info("AI Service: Successfully generated fallback decision using MockAIProvider. Action: {}, Confidence: {}",
                    rawDecision.getAction(), rawDecision.getConfidence());

            } catch (Exception ex) {
                log.error("AI Service: Fallback provider also failed. Error: {}", ex.getMessage(), ex);
                recordFailedAuditEvent(transaction, ex.getMessage(), "MockAIProvider");
                throw new IllegalArgumentException("AI decision generation failed: " + ex.getMessage(), ex);
            }
        }

        // 5. Apply Deterministic Guardrails / Policy Layer (LLM is not authoritative, Guardrail has final say)
        AIRecoveryDecision finalDecision = guardrailService.applyGuardrails(transaction, rawDecision);
        log.info("AI Service: Final guardrail-approved decision for {}: Action: {}", transactionId, finalDecision.getAction());

        return finalDecision;
    }

    @Transactional
    public AIRecoveryDecision generateAndPersistDecision(String transactionId) {
        log.info("AI Service: Generating and persisting decision for transaction ID: {}", transactionId);
        
        Transaction transaction = transactionRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + transactionId));

        // Generate the decision using the existing pipeline
        AIRecoveryDecision decision = generateDecision(transactionId);

        // Remove previous PENDING actions if any to avoid duplicates
        if (transaction.getRecoveryActions() != null) {
            transaction.getRecoveryActions().removeIf(a -> a.getStatus() == com.recoverai.entity.enums.RecoveryActionStatus.PENDING);
        }

        // Persist the decision as a PENDING RecoveryAction
        com.recoverai.entity.RecoveryAction pendingAction = com.recoverai.entity.RecoveryAction.builder()
            .id(UUID.randomUUID().toString())
            .transaction(transaction)
            .actionType(decision.getAction())
            .confidence(decision.getConfidence())
            .expectedRecoveryAmount(decision.getExpectedRecoveryAmount())
            .status(com.recoverai.entity.enums.RecoveryActionStatus.PENDING)
            .reason(decision.getReason())
            .build();
            
        transaction.getRecoveryActions().add(pendingAction);
        
        // Update transaction status to AT_RISK if it was FAILED
        if (transaction.getStatus() == com.recoverai.entity.enums.TransactionStatus.FAILED) {
            transaction.setStatus(com.recoverai.entity.enums.TransactionStatus.AT_RISK);
        }
        transactionRepository.save(transaction);
        
        log.info("AI Service: Successfully persisted PENDING decision {} for transaction {}", pendingAction.getId(), transactionId);
        return decision;
    }

    private void validateDecision(AIRecoveryDecision decision) {
        if (decision == null) {
            throw new IllegalArgumentException("AI output is null.");
        }
        if (decision.getAction() == null) {
            throw new IllegalArgumentException("Action is missing in recovery decision.");
        }
        if (decision.getConfidence() == null || decision.getConfidence() < 0.0 || decision.getConfidence() > 1.0) {
            throw new IllegalArgumentException("Confidence score must be between 0.0 and 1.0.");
        }
        if (decision.getReason() == null || decision.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Reason must be present in recovery decision.");
        }
        if (decision.getExpectedRecoveryAmount() == null || decision.getExpectedRecoveryAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Expected recovery amount must be non-negative.");
        }
        if (decision.getRetryAfterHours() == null || decision.getRetryAfterHours() < 0) {
            throw new IllegalArgumentException("Retry delay hours must be non-negative.");
        }
        if (decision.getRiskLevel() == null) {
            throw new IllegalArgumentException("Risk level is missing in recovery decision.");
        }
    }

    private void recordAuditEvent(Transaction transaction, AIRecoveryDecision decision, String result, String providerName) {
        AuditLog auditLog = AuditLog.builder()
            .id(UUID.randomUUID().toString())
            .transaction(transaction)
            .eventType("AI_DECISION_GENERATED")
            .actor("AI_ENGINE")
            .decision(decision.getAction().name())
            .action(decision.getAction().name())
            .result(result)
            .reason(decision.getReason())
            .confidence(decision.getConfidence())
            .expectedRecoveryAmount(decision.getExpectedRecoveryAmount())
            .retryAfterHours(decision.getRetryAfterHours())
            .riskLevel(decision.getRiskLevel() != null ? decision.getRiskLevel().name() : null)
            .provider(providerName)
            .timestamp(Instant.now())
            .build();
        auditLogRepository.save(auditLog);
    }

    private void recordFailedAuditEvent(Transaction transaction, String errorMessage, String providerName) {
        AuditLog auditLog = AuditLog.builder()
            .id(UUID.randomUUID().toString())
            .transaction(transaction)
            .eventType("AI_DECISION_GENERATED")
            .actor("AI_ENGINE")
            .decision("NONE")
            .action("NONE")
            .result("FAILED")
            .reason("Failed to generate AI decision: " + errorMessage)
            .provider(providerName)
            .timestamp(Instant.now())
            .build();
        auditLogRepository.save(auditLog);
    }
}

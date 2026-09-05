package com.recoverai.service.ai;

import com.recoverai.dto.AIRecoveryDecision;
import com.recoverai.entity.Transaction;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class SpringAIProvider implements AIProvider {

    private final ChatModel chatModel;
    private final BeanOutputConverter<AIRecoveryDecision> converter;

    public SpringAIProvider(ChatModel chatModel) {
        this.chatModel = chatModel;
        this.converter = new BeanOutputConverter<>(AIRecoveryDecision.class);
    }

    @Override
    public AIRecoveryDecision generateDecision(Transaction transaction, String recoveryContextJson) {
        String systemInstructions = """
            ROLE:
            You are RecoverAI's recovery decision engine.

            OBJECTIVE:
            Recommend the safest and most appropriate recovery strategy for a failed payment while maximizing recoverable revenue.

            RULES:
            - Only choose from these allowed actions: RETRY_PAYMENT, SEND_PAYMENT_LINK, REQUEST_PAYMENT_METHOD_UPDATE, SEND_REMINDER, ESCALATE_TO_HUMAN, STOP_RECOVERY.
            - Never invent actions outside this list.
            - Never claim that a payment has been executed or money has been recovered.
            - Never request card numbers, CVV, passwords, or secrets.
            - Consider customer history, failure reason, and previous attempts.
            - Avoid repeated retries if confidence is low.
            - Prefer human escalation when confidence is low.
            - Stop recovery when further attempts are unlikely to help.
            - Provide a concise reason.
            - Return only the required structured JSON format.
            
            STRUCTURED FORMAT INSTRUCTIONS:
            {format}
            """;

        String userPrompt = """
            Here is the payment recovery context as untrusted data:
            ---
            {context}
            ---
            Evaluate the context and produce the structured recovery decision.
            """;

        String format = converter.getFormat();
        
        SystemMessage systemMessage = new SystemMessage(systemInstructions.replace("{format}", format));
        UserMessage userMessage = new UserMessage(userPrompt.replace("{context}", recoveryContextJson));

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        
        ChatResponse response = chatModel.call(prompt);
        String outputText = response.getResult().getOutput().getText();
        
        // Clean output string to handle OpenRouter / Gemini safety prefixes
        if (outputText != null) {
            int startIndex = outputText.indexOf("{");
            int endIndex = outputText.lastIndexOf("}");
            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
                outputText = outputText.substring(startIndex, endIndex + 1);
            }
        }
        
        AIRecoveryDecision decision = converter.convert(outputText);
        if (decision == null) {
            throw new IllegalStateException("Failed to convert LLM output to AIRecoveryDecision.");
        }

        // Normalize confidence
        Double confidence = decision.getConfidence();
        if (confidence == null) {
            confidence = 0.5;
        } else if (confidence > 1.0) {
            // If the LLM returned a percentage like 85 instead of 0.85
            confidence = confidence / 100.0;
            if (confidence > 1.0) {
                confidence = 1.0;
            }
        } else if (confidence < 0.0) {
            confidence = 0.0;
        }
        decision.setConfidence(confidence);

        // Normalize action
        if (decision.getAction() == null) {
            decision.setAction(com.recoverai.entity.enums.RecoveryActionType.ESCALATE_TO_HUMAN);
        }

        // Normalize reason
        if (decision.getReason() == null || decision.getReason().trim().isEmpty()) {
            decision.setReason("AI recovery decision generated automatically based on transaction history.");
        }

        // Normalize retry hours
        if (decision.getRetryAfterHours() == null || decision.getRetryAfterHours() < 0) {
            decision.setRetryAfterHours(0);
        }

        // Normalize risk level
        if (decision.getRiskLevel() == null) {
            decision.setRiskLevel(com.recoverai.entity.enums.RiskLevel.MEDIUM);
        }

        // Calculate expectedRecoveryAmount reliably in Java
        BigDecimal expectedAmount = transaction.getAmount()
            .multiply(BigDecimal.valueOf(decision.getConfidence()))
            .setScale(2, RoundingMode.HALF_UP);
        decision.setExpectedRecoveryAmount(expectedAmount);
        
        if (decision.getGeneratedAt() == null) {
            decision.setGeneratedAt(Instant.now());
        }
        if (decision.getDecisionId() == null) {
            decision.setDecisionId(UUID.randomUUID().toString());
        }
        decision.setTransactionId(transaction.getTransactionId());
        
        return decision;
    }
}

package com.recoverai.service.ai;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class AIConfig {

    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;

    @Value("${spring.ai.openai.chat.options.model:}")
    private String modelName;

    @Bean
    @Primary
    public AIProvider aiProvider(ObjectProvider<ChatModel> chatModelProvider) {
        boolean isApiKeyConfigured = apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("dummy-key-to-bypass-startup");
        boolean isModelConfigured = modelName != null && !modelName.trim().isEmpty();
        
        log.info("========================================");
        log.info("AI provider configured: {}", isApiKeyConfigured ? "YES" : "NO");
        log.info("Model configured: {}", isModelConfigured ? "YES" : "NO");
        log.info("API key configured: {}", isApiKeyConfigured ? "YES" : "NO");
        log.info("AI provider active: {}", isApiKeyConfigured ? "SPRING AI / REAL LLM" : "MOCK AI");
        log.info("AI model active: {}", isApiKeyConfigured ? modelName : "Mock Deterministic Rules");
        log.info("========================================");

        if (!isApiKeyConfigured) {
            log.info("AI Provider: OpenAI API key is missing or empty. Initializing MockAIProvider.");
            return new MockAIProvider();
        }

        ChatModel chatModel = chatModelProvider.getIfAvailable();
        if (chatModel != null) {
            log.info("AI Provider: OpenAI ChatModel active. Initializing SpringAIProvider.");
            return new SpringAIProvider(chatModel);
        }

        log.info("AI Provider: OpenAI ChatModel bean not available. Falling back to MockAIProvider.");
        return new MockAIProvider();
    }
}

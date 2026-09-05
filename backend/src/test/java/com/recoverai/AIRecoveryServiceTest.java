package com.recoverai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recoverai.dto.AIRecoveryDecision;
import com.recoverai.entity.AuditLog;
import com.recoverai.entity.Customer;
import com.recoverai.entity.PaymentAttempt;
import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.PaymentAttemptStatus;
import com.recoverai.entity.enums.RecoveryActionType;
import com.recoverai.entity.enums.RiskLevel;
import com.recoverai.entity.enums.TransactionStatus;
import com.recoverai.repository.AuditLogRepository;
import com.recoverai.repository.TransactionRepository;
import com.recoverai.service.ai.AIRecoveryService;
import com.recoverai.service.ai.MockAIProvider;
import com.recoverai.service.ai.RecoveryContextBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AIRecoveryServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Spy
    private RecoveryContextBuilder contextBuilder = new RecoveryContextBuilder();

    @Spy
    private MockAIProvider aiProvider = new MockAIProvider();

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper()
        .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @InjectMocks
    private AIRecoveryService aiRecoveryService;

    private Transaction mockTransaction;
    private Customer mockCustomer;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        mockCustomer = Customer.builder()
            .id("cust-123")
            .name("Priya Deshmukh")
            .email("priya@enterprise.in")
            .lifetimeValue(BigDecimal.valueOf(50000.00))
            .successfulPaymentCount(10)
            .failedPaymentCount(1)
            .transactions(new ArrayList<>())
            .build();

        mockTransaction = Transaction.builder()
            .id("txn-999")
            .transactionId("TXN-99999")
            .customer(mockCustomer)
            .amount(BigDecimal.valueOf(5000.00))
            .currency("INR")
            .paymentMethod("HDFC Credit Card (•••• 1234)")
            .status(TransactionStatus.FAILED)
            .failureReason(FailureReason.INSUFFICIENT_FUNDS)
            .riskLevel(RiskLevel.LOW)
            .recoveryPriority(com.recoverai.entity.enums.RecoveryPriority.LOW)
            .createdAt(Instant.now().minusSeconds(3600))
            .paymentAttempts(new ArrayList<>())
            .recoveryActions(new ArrayList<>())
            .auditLogs(new ArrayList<>())
            .build();

        // Bidirectional link
        mockCustomer.getTransactions().add(mockTransaction);
        
        PaymentAttempt attempt = PaymentAttempt.builder()
            .id("att-1")
            .transaction(mockTransaction)
            .attemptNumber(1)
            .status(PaymentAttemptStatus.FAILED)
            .failureReason("INSUFFICIENT_FUNDS")
            .attemptedAt(Instant.now().minusSeconds(3500))
            .build();
        mockTransaction.getPaymentAttempts().add(attempt);
    }

    @Test
    public void testRecoveryContextBuilder_SanitizationAndContext() {
        Map<String, Object> context = contextBuilder.buildContext(mockTransaction);
        assertNotNull(context);
        
        Map<String, Object> custMap = (Map<String, Object>) context.get("customer");
        assertNotNull(custMap);
        assertEquals("cust-123", custMap.get("customerId"));
        assertEquals(BigDecimal.valueOf(50000.00), custMap.get("lifetimeValue"));
        assertEquals(10, custMap.get("successfulPaymentCount"));
        assertEquals(BigDecimal.valueOf(5000.00).setScale(2), custMap.get("averageTransactionValue"));

        // Check computed derived features
        assertNotNull(custMap.get("successRate"));
        assertNotNull(custMap.get("failureRate"));
        assertEquals(10.0 / 11.0, (Double) custMap.get("successRate"), 0.001);

        Map<String, Object> txnMap = (Map<String, Object>) context.get("transaction");
        assertNotNull(txnMap);
        String masked = (String) txnMap.get("paymentMethod");
        assertTrue(masked.contains("••••"));
    }

    @Test
    public void testMockAIProvider_InsufficientFundsStrongHistory() throws Exception {
        Map<String, Object> contextMap = contextBuilder.buildContext(mockTransaction);
        String contextJson = objectMapper.writeValueAsString(contextMap);

        AIRecoveryDecision decision = aiProvider.generateDecision(mockTransaction, contextJson);
        assertNotNull(decision);
        assertEquals(RecoveryActionType.RETRY_PAYMENT, decision.getAction());
        assertEquals(0.8727, decision.getConfidence(), 0.01);
        assertEquals(24, decision.getRetryAfterHours());
        assertTrue(decision.getReason().contains("success rate"));
    }

    @Test
    public void testMockAIProvider_CardExpired() throws Exception {
        mockTransaction.setFailureReason(FailureReason.CARD_EXPIRED);
        Map<String, Object> contextMap = contextBuilder.buildContext(mockTransaction);
        String contextJson = objectMapper.writeValueAsString(contextMap);

        AIRecoveryDecision decision = aiProvider.generateDecision(mockTransaction, contextJson);
        assertNotNull(decision);
        assertEquals(RecoveryActionType.REQUEST_PAYMENT_METHOD_UPDATE, decision.getAction());
        assertEquals(0.927, decision.getConfidence(), 0.01);
        assertEquals(0, decision.getRetryAfterHours());
        assertTrue(decision.getReason().contains("expired"));
    }

    @Test
    public void testMockAIProvider_LimitExceeded() throws Exception {
        mockTransaction.setFailureReason(FailureReason.LIMIT_EXCEEDED);
        Map<String, Object> contextMap = contextBuilder.buildContext(mockTransaction);
        String contextJson = objectMapper.writeValueAsString(contextMap);

        AIRecoveryDecision decision = aiProvider.generateDecision(mockTransaction, contextJson);
        assertNotNull(decision);
        assertEquals(RecoveryActionType.SEND_PAYMENT_LINK, decision.getAction());
        assertEquals(0.88, decision.getConfidence(), 0.01);
    }

    @Test
    public void testMockAIProvider_RepeatedBankDecline() throws Exception {
        mockTransaction.setFailureReason(FailureReason.BANK_DECLINED);
        mockTransaction.getPaymentAttempts().add(PaymentAttempt.builder().id("att-2").transaction(mockTransaction).attemptNumber(2).status(PaymentAttemptStatus.FAILED).attemptedAt(Instant.now().minusSeconds(2000)).build());
        mockTransaction.getPaymentAttempts().add(PaymentAttempt.builder().id("att-3").transaction(mockTransaction).attemptNumber(3).status(PaymentAttemptStatus.FAILED).attemptedAt(Instant.now().minusSeconds(1000)).build());

        Map<String, Object> contextMap = contextBuilder.buildContext(mockTransaction);
        String contextJson = objectMapper.writeValueAsString(contextMap);

        AIRecoveryDecision decision = aiProvider.generateDecision(mockTransaction, contextJson);
        assertNotNull(decision);
        assertEquals(RecoveryActionType.STOP_RECOVERY, decision.getAction());
        assertEquals(0.90, decision.getConfidence());
    }

    @Test
    public void testAIRecoveryService_SuccessfulAuditGenerated() {
        when(transactionRepository.findByTransactionId("TXN-99999")).thenReturn(Optional.of(mockTransaction));
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(new AuditLog());

        AIRecoveryDecision decision = aiRecoveryService.generateDecision("TXN-99999");
        assertNotNull(decision);

        // Immutability Check: Transaction remains unchanged
        assertEquals(TransactionStatus.FAILED, mockTransaction.getStatus());

        // Verify audit log parameters captured correctly
        ArgumentCaptor<AuditLog> auditCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository, times(1)).save(auditCaptor.capture());
        
        AuditLog savedLog = auditCaptor.getValue();
        assertEquals("AI_DECISION_GENERATED", savedLog.getEventType());
        assertEquals("AI_ENGINE", savedLog.getActor());
        assertEquals("SUCCESS", savedLog.getResult());
        assertEquals(decision.getAction().name(), savedLog.getAction());
        assertEquals(decision.getReason(), savedLog.getReason());
        assertNotNull(savedLog.getConfidence());
        assertNotNull(savedLog.getExpectedRecoveryAmount());
        assertNotNull(savedLog.getProvider());
    }

    @Test
    public void testDynamicBehavior_ContextChange() throws Exception {
        // First state: success rate 10/11 = 90.9%
        Map<String, Object> contextMap1 = contextBuilder.buildContext(mockTransaction);
        String contextJson1 = objectMapper.writeValueAsString(contextMap1);
        AIRecoveryDecision decision1 = aiProvider.generateDecision(mockTransaction, contextJson1);

        // Modify customer success rate: 2 successes, 8 failures (success rate = 20%)
        mockCustomer.setSuccessfulPaymentCount(2);
        mockCustomer.setFailedPaymentCount(8);

        Map<String, Object> contextMap2 = contextBuilder.buildContext(mockTransaction);
        String contextJson2 = objectMapper.writeValueAsString(contextMap2);
        AIRecoveryDecision decision2 = aiProvider.generateDecision(mockTransaction, contextJson2);

        // Verify that changing customer success rate dynamically altered the output confidence and reasoning
        assertNotEquals(decision1.getConfidence(), decision2.getConfidence());
        assertNotEquals(decision1.getReason(), decision2.getReason());
        assertNotEquals(decision1.getExpectedRecoveryAmount(), decision2.getExpectedRecoveryAmount());
        assertTrue(decision2.getConfidence() < decision1.getConfidence());
    }
}

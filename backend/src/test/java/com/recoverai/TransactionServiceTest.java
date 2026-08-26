package com.recoverai;

import com.recoverai.dto.PageResponse;
import com.recoverai.dto.TransactionDetailDto;
import com.recoverai.dto.TransactionSummaryDto;
import com.recoverai.entity.Customer;
import com.recoverai.entity.Transaction;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RecoveryPriority;
import com.recoverai.entity.enums.RiskLevel;
import com.recoverai.entity.enums.TransactionStatus;
import com.recoverai.repository.CustomerRepository;
import com.recoverai.repository.TransactionRepository;
import com.recoverai.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TransactionServiceTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Test
    void shouldRetrieveAndFilterTransactions() {
        PageResponse<TransactionSummaryDto> response = transactionService.getTransactions(
                null, TransactionStatus.RECOVERED, null, null, PageRequest.of(0, 10)
        );

        assertNotNull(response);
        assertNotNull(response.getContent());
        assertFalse(response.getContent().isEmpty());
        assertEquals(TransactionStatus.RECOVERED, response.getContent().get(0).getStatus());
    }

    @Test
    void shouldRetrieveTransactionDetailsWithRelations() {
        Transaction txn = transactionRepository.findAll().get(0);
        TransactionDetailDto detail = transactionService.getTransactionById(txn.getTransactionId());

        assertNotNull(detail);
        assertEquals(txn.getTransactionId(), detail.getTransactionId());
        assertNotNull(detail.getCustomer());
        assertNotNull(detail.getPaymentAttempts());
        assertNotNull(detail.getRecoveryActions());
    }
}

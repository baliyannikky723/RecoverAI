package com.recoverai.service;

import com.recoverai.entity.Transaction;
import com.recoverai.repository.TransactionRepository;
import com.recoverai.service.ai.AIRecoveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BatchProcessingService {

    private final TransactionRepository transactionRepository;
    private final AIRecoveryService aiRecoveryService;

    /**
     * Runs every 30 seconds to process a batch of failed transactions.
     * We limit the batch size to 5 to avoid overwhelming the AI API (especially the free tier).
     */
    @Scheduled(fixedDelay = 30000)
    public void processFailedTransactionsBatch() {
        log.info("BatchProcessor: Waking up to find unprocessed FAILED/AT_RISK transactions...");

        // Fetch up to 5 unprocessed transactions
        List<Transaction> unprocessedTransactions = transactionRepository.findUnprocessedFailedTransactions(Pageable.ofSize(5));

        if (unprocessedTransactions.isEmpty()) {
            log.info("BatchProcessor: No unprocessed transactions found. Sleeping.");
            return;
        }

        log.info("BatchProcessor: Found {} transactions to process in this batch.", unprocessedTransactions.size());

        int successCount = 0;
        int failureCount = 0;

        for (Transaction transaction : unprocessedTransactions) {
            String transactionId = transaction.getTransactionId();
            try {
                log.info("BatchProcessor: Processing transaction {}", transactionId);
                // Call the existing webhook logic which generates and persists the AI decision
                aiRecoveryService.generateAndPersistDecision(transactionId);
                successCount++;
            } catch (Exception e) {
                log.error("BatchProcessor: Failed to process transaction {}. Error: {}", transactionId, e.getMessage(), e);
                failureCount++;
                // We catch the exception so that the batch loop can continue with the next transaction
            }
        }

        log.info("BatchProcessor: Batch completed. Successfully processed: {}, Failed: {}", successCount, failureCount);
    }
}

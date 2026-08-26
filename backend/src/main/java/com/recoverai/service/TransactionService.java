package com.recoverai.service;

import com.recoverai.dto.*;
import com.recoverai.entity.*;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RiskLevel;
import com.recoverai.entity.enums.TransactionStatus;
import com.recoverai.exception.ResourceNotFoundException;
import com.recoverai.repository.AuditLogRepository;
import com.recoverai.repository.PaymentAttemptRepository;
import com.recoverai.repository.RecoveryActionRepository;
import com.recoverai.repository.TransactionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final RecoveryActionRepository recoveryActionRepository;
    private final AuditLogRepository auditLogRepository;
    private final CustomerService customerService;

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
}

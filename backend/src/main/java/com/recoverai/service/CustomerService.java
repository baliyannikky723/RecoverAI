package com.recoverai.service;

import com.recoverai.dto.CustomerDetailDto;
import com.recoverai.dto.CustomerSummaryDto;
import com.recoverai.dto.TransactionSummaryDto;
import com.recoverai.entity.Customer;
import com.recoverai.entity.Transaction;
import com.recoverai.exception.ResourceNotFoundException;
import com.recoverai.repository.CustomerRepository;
import com.recoverai.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public CustomerDetailDto getCustomerById(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        List<Transaction> transactions = transactionRepository.findByCustomerIdOrderByCreatedAtDesc(id);
        List<TransactionSummaryDto> history = transactions.stream()
                .map(this::mapToTransactionSummary)
                .toList();

        int total = customer.getSuccessfulPaymentCount() + customer.getFailedPaymentCount();
        int reliability = total > 0 ? (int) Math.round((customer.getSuccessfulPaymentCount() * 100.0) / total) : 100;

        return CustomerDetailDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .lifetimeValue(customer.getLifetimeValue())
                .successfulPaymentCount(customer.getSuccessfulPaymentCount())
                .failedPaymentCount(customer.getFailedPaymentCount())
                .reliabilityScore(reliability)
                .createdAt(customer.getCreatedAt())
                .transactionHistory(history)
                .build();
    }

    public CustomerSummaryDto mapToCustomerSummary(Customer customer) {
        if (customer == null) return null;
        int total = customer.getSuccessfulPaymentCount() + customer.getFailedPaymentCount();
        int reliability = total > 0 ? (int) Math.round((customer.getSuccessfulPaymentCount() * 100.0) / total) : 100;

        return CustomerSummaryDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .lifetimeValue(customer.getLifetimeValue())
                .successfulPaymentCount(customer.getSuccessfulPaymentCount())
                .failedPaymentCount(customer.getFailedPaymentCount())
                .reliabilityScore(reliability)
                .createdAt(customer.getCreatedAt())
                .build();
    }

    private TransactionSummaryDto mapToTransactionSummary(Transaction t) {
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
}

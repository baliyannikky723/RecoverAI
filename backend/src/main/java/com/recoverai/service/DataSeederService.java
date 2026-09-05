package com.recoverai.service;

import com.recoverai.entity.*;
import com.recoverai.entity.enums.*;
import com.recoverai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSeederService implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final PaymentAttemptRepository paymentAttemptRepository;
    private final RecoveryActionRepository recoveryActionRepository;
    private final AuditLogRepository auditLogRepository;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Data seeding is disabled.");
            return;
        }

        if (customerRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data population.");
            return;
        }

        log.info("Starting RecoverAI realistic demo data seeding (500 customers, 1000 transactions)...");
        long start = System.currentTimeMillis();

        seedRealisticData();

        log.info("Data seeding completed in {}ms. Total Customers: {}, Transactions: {}",
                System.currentTimeMillis() - start, customerRepository.count(), transactionRepository.count());
    }

    private void seedRealisticData() {
        Random random = new Random(42); // deterministic seed for consistency

        String[] firstNames = {"Aarav", "Aditi", "Rahul", "Priya", "Vikram", "Sneha", "Rohan", "Ananya", "Karan", "Pooja",
                "Deepak", "Neha", "Amit", "Kavita", "Siddharth", "Meera", "Arjun", "Tanvi", "Gaurav", "Simran",
                "Rajesh", "Sunita", "Harsh", "Divya", "Manish", "Ritu", "Akash", "Shreya", "Nikhil", "Ishita"};

        String[] lastNames = {"Sharma", "Verma", "Mehta", "Patel", "Gupta", "Singh", "Nair", "Reddy", "Chopra", "Iyer",
                "Kapoor", "Bhatia", "Deshmukh", "Joshi", "Bansal", "Aggarwal", "Malhotra", "Saxena", "Choudhury", "Menon"};

        String[] emailDomains = {"gmail.com", "outlook.com", "yahoo.com", "enterprise.in", "fintechhub.com", "corp.net"};

        String[] paymentMethods = {"HDFC Credit Card (•••• 4012)", "ICICI Debit Card (•••• 8821)", "SBI NetBanking",
                "UPI (GPay / PhonePe)", "Axis Bank Card (•••• 1099)", "Razorpay AutoPay", "Paytm Wallet / UPI"};

        FailureReason[] failureReasons = FailureReason.values();
        RiskLevel[] riskLevels = RiskLevel.values();
        RecoveryPriority[] priorities = RecoveryPriority.values();
        TransactionStatus[] statuses = TransactionStatus.values();
        RecoveryActionType[] actionTypes = RecoveryActionType.values();
        RecoveryActionStatus[] actionStatuses = RecoveryActionStatus.values();

        // 1. Create 500 Customers
        List<Customer> customers = new ArrayList<>(500);
        for (int i = 1; i <= 500; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String fullName = firstName + " " + lastName;
            String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@" + emailDomains[random.nextInt(emailDomains.length)];

            int successCount = random.nextInt(1, 45);
            int failedCount = random.nextInt(0, 8);
            BigDecimal ltv = BigDecimal.valueOf(random.nextDouble(5000, 180000)).setScale(2, RoundingMode.HALF_UP);
            Instant createdAt = Instant.now().minus(random.nextInt(30, 365), ChronoUnit.DAYS);

            Customer customer = Customer.builder()
                    .id(UUID.randomUUID().toString())
                    .name(fullName)
                    .email(email)
                    .lifetimeValue(ltv)
                    .successfulPaymentCount(successCount)
                    .failedPaymentCount(failedCount)
                    .createdAt(createdAt)
                    .build();

            customers.add(customer);
        }
        customerRepository.saveAll(customers);

        // 2. Create 1000 Transactions with Attempts, Actions, Audit Logs
        List<Transaction> transactions = new ArrayList<>(1000);
        List<PaymentAttempt> paymentAttempts = new ArrayList<>();
        List<RecoveryAction> recoveryActions = new ArrayList<>();
        List<AuditLog> auditLogs = new ArrayList<>();

        for (int i = 1; i <= 1000; i++) {
            Customer customer = customers.get(random.nextInt(customers.size()));
            String txnId = "TXN-" + (10000 + i);

            // Distribution: ~40% Recovered, ~25% At-Risk, ~15% Failed, ~10% Recovering, ~5% Escalated, ~5% Stopped
            int statusRoll = random.nextInt(100);
            TransactionStatus status;
            if (statusRoll < 40) status = TransactionStatus.RECOVERED;
            else if (statusRoll < 65) status = TransactionStatus.AT_RISK;
            else if (statusRoll < 80) status = TransactionStatus.FAILED;
            else if (statusRoll < 90) status = TransactionStatus.RECOVERING;
            else if (statusRoll < 95) status = TransactionStatus.ESCALATED;
            else status = TransactionStatus.STOPPED;

            FailureReason reason = failureReasons[random.nextInt(failureReasons.length)];
            RiskLevel risk = riskLevels[random.nextInt(riskLevels.length)];
            RecoveryPriority priority = priorities[random.nextInt(priorities.length)];

            double rawAmount = (random.nextInt(10) < 7)
                    ? random.nextDouble(499, 9999)
                    : random.nextDouble(10000, 75000);
            BigDecimal amount = BigDecimal.valueOf(rawAmount).setScale(2, RoundingMode.HALF_UP);

            Instant txnCreatedAt = Instant.now().minus(random.nextInt(1, 90), ChronoUnit.DAYS)
                    .minus(random.nextInt(1, 23), ChronoUnit.HOURS);
            Instant txnUpdatedAt = txnCreatedAt.plus(random.nextInt(1, 48), ChronoUnit.HOURS);

            Transaction txn = Transaction.builder()
                    .id(UUID.randomUUID().toString())
                    .transactionId(txnId)
                    .customer(customer)
                    .amount(amount)
                    .currency("INR")
                    .paymentMethod(paymentMethods[random.nextInt(paymentMethods.length)])
                    .status(status)
                    .failureReason(reason)
                    .riskLevel(risk)
                    .recoveryPriority(priority)
                    .createdAt(txnCreatedAt)
                    .updatedAt(txnUpdatedAt)
                    .build();

            transactions.add(txn);

            // Payment Attempts (1 to 3 attempts)
            int attemptsCount = (status == TransactionStatus.RECOVERED) ? random.nextInt(2, 4) : random.nextInt(1, 3);
            for (int a = 1; a <= attemptsCount; a++) {
                PaymentAttemptStatus attemptStatus;
                String attemptFailure = null;
                if (a == attemptsCount && status == TransactionStatus.RECOVERED) {
                    attemptStatus = PaymentAttemptStatus.SUCCESS;
                } else {
                    attemptStatus = PaymentAttemptStatus.FAILED;
                    attemptFailure = reason.name();
                }

                PaymentAttempt attempt = PaymentAttempt.builder()
                        .id(UUID.randomUUID().toString())
                        .transaction(txn)
                        .attemptNumber(a)
                        .status(attemptStatus)
                        .failureReason(attemptFailure)
                        .attemptedAt(txnCreatedAt.plus(a * 4L, ChronoUnit.HOURS))
                        .build();

                paymentAttempts.add(attempt);
            }

            // Recovery Action
            boolean seedAction = (status != TransactionStatus.AT_RISK && status != TransactionStatus.FAILED);
            RecoveryActionType actionType = actionTypes[random.nextInt(actionTypes.length)];
            
            if (seedAction) {
                RecoveryActionStatus actionStatus = actionStatuses[random.nextInt(actionStatuses.length)];
                double confidence = BigDecimal.valueOf(random.nextDouble(55, 96)).setScale(1, RoundingMode.HALF_UP).doubleValue();
                BigDecimal expectedRecovery = amount.multiply(BigDecimal.valueOf(confidence / 100.0)).setScale(2, RoundingMode.HALF_UP);

                RecoveryAction action = RecoveryAction.builder()
                        .id(UUID.randomUUID().toString())
                        .transaction(txn)
                        .actionType(actionType)
                        .confidence(confidence)
                        .expectedRecoveryAmount(expectedRecovery)
                        .status(actionStatus)
                        .reason(generateActionReason(actionType, reason))
                        .createdAt(txnCreatedAt.plus(1, ChronoUnit.HOURS))
                        .executedAt(actionStatus == RecoveryActionStatus.EXECUTED ? txnCreatedAt.plus(6, ChronoUnit.HOURS) : null)
                        .build();

                recoveryActions.add(action);
            }

            // Audit Logs
            AuditLog auditLog1 = AuditLog.builder()
                    .id(UUID.randomUUID().toString())
                    .transaction(txn)
                    .eventType("Payment Failed")
                    .actor("GATEWAY")
                    .decision("Flagged At-Risk")
                    .action("Captured initial failure")
                    .result("Failed")
                    .reason(reason.name())
                    .timestamp(txnCreatedAt)
                    .build();
            auditLogs.add(auditLog1);

            if (seedAction) {
                AuditLog auditLog2 = AuditLog.builder()
                        .id(UUID.randomUUID().toString())
                        .transaction(txn)
                        .eventType("Recovery Planned")
                        .actor("DECISION_ENGINE")
                        .decision(actionType.name())
                        .action("Generated recovery recommendation")
                        .result("PLANNED")
                        .reason("Confidence: 85% | Priority: " + priority.name())
                        .timestamp(txnCreatedAt.plus(30, ChronoUnit.MINUTES))
                        .build();
                auditLogs.add(auditLog2);
            }
        }

        transactionRepository.saveAll(transactions);
        paymentAttemptRepository.saveAll(paymentAttempts);
        recoveryActionRepository.saveAll(recoveryActions);
        auditLogRepository.saveAll(auditLogs);
    }

    private String generateActionReason(RecoveryActionType actionType, FailureReason reason) {
        return switch (actionType) {
            case RETRY_PAYMENT -> "Soft decline detected (" + reason.name() + "). Scheduled optimal retry window.";
            case SEND_PAYMENT_LINK -> "Customer active on mobile. Direct payment link with UPI options generated.";
            case REQUEST_PAYMENT_METHOD_UPDATE -> "Payment method expired or limit reached. Email update link dispatched.";
            case SEND_REMINDER -> "Gentle reminder sent via SMS and Email with 1-click retry.";
            case ESCALATE_TO_HUMAN -> "High value customer with repeated hard declines. Assigned to VIP support queue.";
            case STOP_RECOVERY -> "Max attempts reached with persistent card block. Recovery halted to avoid dispute.";
        };
    }
}

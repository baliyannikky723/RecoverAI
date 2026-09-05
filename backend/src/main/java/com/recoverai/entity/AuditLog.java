package com.recoverai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(nullable = false, length = 50)
    private String actor;

    @Column(length = 255)
    private String decision;

    @Column(length = 255)
    private String action;

    @Column(length = 50)
    private String result;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "confidence")
    private Double confidence;

    @Column(name = "expected_recovery_amount", precision = 14, scale = 2)
    private BigDecimal expectedRecoveryAmount;

    @Column(name = "retry_after_hours")
    private Integer retryAfterHours;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;

    @Column(name = "provider", length = 50)
    private String provider;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant timestamp;
}

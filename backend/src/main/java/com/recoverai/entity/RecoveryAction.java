package com.recoverai.entity;

import com.recoverai.entity.enums.RecoveryActionStatus;
import com.recoverai.entity.enums.RecoveryActionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "recovery_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecoveryAction {

    @Id
    @Column(length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private RecoveryActionType actionType;

    @Column
    private Double confidence;

    @Column(name = "expected_recovery_amount", precision = 14, scale = 2)
    private BigDecimal expectedRecoveryAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RecoveryActionStatus status;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "executed_at")
    private Instant executedAt;
}

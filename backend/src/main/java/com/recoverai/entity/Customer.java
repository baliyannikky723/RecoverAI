package com.recoverai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "lifetime_value", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal lifetimeValue = BigDecimal.ZERO;

    @Column(name = "successful_payment_count", nullable = false)
    @Builder.Default
    private Integer successfulPaymentCount = 0;

    @Column(name = "failed_payment_count", nullable = false)
    @Builder.Default
    private Integer failedPaymentCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Transaction> transactions = new ArrayList<>();
}

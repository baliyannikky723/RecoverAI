package com.recoverai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryDto {
    private String id;
    private String name;
    private String email;
    private BigDecimal lifetimeValue;
    private Integer successfulPaymentCount;
    private Integer failedPaymentCount;
    private Integer reliabilityScore;
    private Instant createdAt;
}

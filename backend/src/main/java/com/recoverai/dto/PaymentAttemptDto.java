package com.recoverai.dto;

import com.recoverai.entity.enums.PaymentAttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentAttemptDto {
    private String id;
    private Integer attemptNumber;
    private PaymentAttemptStatus status;
    private String failureReason;
    private Instant attemptedAt;
}

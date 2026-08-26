package com.recoverai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private String id;
    private String transactionId;
    private String eventType;
    private String actor;
    private String decision;
    private String action;
    private String result;
    private String reason;
    private Instant timestamp;
}

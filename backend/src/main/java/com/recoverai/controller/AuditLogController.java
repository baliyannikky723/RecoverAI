package com.recoverai.controller;

import com.recoverai.dto.AuditLogDto;
import com.recoverai.dto.PageResponse;
import com.recoverai.service.AuditLogService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<PageResponse<AuditLogDto>> getAuditLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String actor,
            @RequestParam(required = false) String event,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        PageResponse<AuditLogDto> response = auditLogService.getAuditLogs(search, actor, event, pageRequest);
        return ResponseEntity.ok(response);
    }
}

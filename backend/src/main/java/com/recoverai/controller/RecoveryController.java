package com.recoverai.controller;

import com.recoverai.dto.PageResponse;
import com.recoverai.dto.RecoveryActionDto;
import com.recoverai.entity.enums.RecoveryActionStatus;
import com.recoverai.service.RecoveryService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/recovery")
@RequiredArgsConstructor
public class RecoveryController {

    private final RecoveryService recoveryService;

    @GetMapping
    public ResponseEntity<PageResponse<RecoveryActionDto>> getRecoveryActions(
            @RequestParam(required = false) RecoveryActionStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<RecoveryActionDto> response = recoveryService.getRecoveryActions(status, pageRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecoveryActionDto> getRecoveryActionById(@PathVariable String id) {
        RecoveryActionDto dto = recoveryService.getRecoveryActionById(id);
        return ResponseEntity.ok(dto);
    }
}

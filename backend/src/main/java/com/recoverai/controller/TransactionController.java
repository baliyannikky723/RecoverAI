package com.recoverai.controller;

import com.recoverai.dto.PageResponse;
import com.recoverai.dto.TransactionDetailDto;
import com.recoverai.dto.TransactionSummaryDto;
import com.recoverai.entity.enums.FailureReason;
import com.recoverai.entity.enums.RiskLevel;
import com.recoverai.entity.enums.TransactionStatus;
import com.recoverai.service.TransactionService;
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
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<PageResponse<TransactionSummaryDto>> getTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) RiskLevel risk,
            @RequestParam(required = false) FailureReason failureReason,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(10000) int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<TransactionSummaryDto> response = transactionService.getTransactions(
                search, status, risk, failureReason, pageRequest
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDetailDto> getTransactionById(@PathVariable String id) {
        TransactionDetailDto detail = transactionService.getTransactionById(id);
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/{id}/execute-strategy")
    public ResponseEntity<TransactionDetailDto> executeStrategy(
            @PathVariable String id,
            @RequestBody com.recoverai.dto.AIRecoveryDecision decision
    ) {
        TransactionDetailDto updated = transactionService.executeStrategy(id, decision);
        return ResponseEntity.ok(updated);
    }
}

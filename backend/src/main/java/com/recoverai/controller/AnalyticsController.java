package com.recoverai.controller;

import com.recoverai.dto.AnalyticsSummaryDto;
import com.recoverai.dto.RecoveryComparisonDto;
import com.recoverai.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getAnalyticsSummary() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/recovery-comparison")
    public ResponseEntity<RecoveryComparisonDto> getRecoveryComparison() {
        RecoveryComparisonDto comparison = analyticsService.getRecoveryComparison();
        return ResponseEntity.ok(comparison);
    }
}

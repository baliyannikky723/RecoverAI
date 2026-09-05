package com.recoverai.controller;

import com.recoverai.dto.AIRecoveryDecision;
import com.recoverai.service.ai.AIRecoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class AIController {

    private final AIRecoveryService aiRecoveryService;

    @PostMapping("/{id}/ai-decision")
    public ResponseEntity<AIRecoveryDecision> generateDecision(@PathVariable String id) {
        AIRecoveryDecision decision = aiRecoveryService.generateAndPersistDecision(id);
        return ResponseEntity.ok(decision);
    }
}

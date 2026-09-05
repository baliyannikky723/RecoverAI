package com.recoverai.controller;

import com.recoverai.dto.DemoRequestDto;
import com.recoverai.entity.AuditLog;
import com.recoverai.repository.AuditLogRepository;
import com.recoverai.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ContactController {

    private final EmailService emailService;
    private final AuditLogRepository auditLogRepository;

    @PostMapping("/demo")
    public ResponseEntity<?> submitDemoRequest(@Valid @RequestBody DemoRequestDto request) {
        log.info("Received custom demo inquiry for email: {}, company: {}", request.getEmail(), request.getCompany());

        EmailService.EmailDispatchResult result = emailService.sendDemoConfirmation(
                request.getEmail(),
                request.getName(),
                request.getCompany()
        );

        // Record audit trail event
        try {
            AuditLog logEntry = AuditLog.builder()
                    .id(UUID.randomUUID().toString())
                    .eventType("DEMO_REQUEST_RECEIVED")
                    .actor("LEAD:" + request.getEmail())
                    .decision("DISPATCH_CONFIRMATION_EMAIL")
                    .action(result.isLiveSent() ? "SMTP_EMAIL_DELIVERED" : "SANDBOX_DEMO_SCHEDULED")
                    .result("SUCCESS")
                    .provider(result.getProvider())
                    .reason("Prospective customer requested custom platform demo and recovery assessment.")
                    .build();
            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("Failed to write audit log for demo request: {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "isLiveSent", result.isLiveSent(),
                "recipient", result.getRecipient(),
                "provider", result.getProvider(),
                "message", result.getMessage(),
                "timestamp", result.getTimestamp().toString()
        ));
    }
}

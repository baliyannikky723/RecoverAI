package com.recoverai.controller;

import com.recoverai.dto.RazorpayWebhookPayload;
import com.recoverai.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final TransactionService transactionService;

    @PostMapping("/razorpay")
    public ResponseEntity<Map<String, Object>> handleRazorpayWebhook(@RequestBody RazorpayWebhookPayload payload) {
        log.info("Received Razorpay webhook: {}", payload.getEvent());

        if (!"payment.failed".equals(payload.getEvent())) {
            log.warn("Ignored non-payment.failed event: {}", payload.getEvent());
            return ResponseEntity.badRequest().body(Map.of("error", "Only payment.failed event is supported for simulation"));
        }

        if (payload.getPayload() == null || 
            payload.getPayload().getPayment() == null || 
            payload.getPayload().getPayment().getEntity() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid payload structure"));
        }

        RazorpayWebhookPayload.Entity entity = payload.getPayload().getPayment().getEntity();
        if (entity.getId() == null || entity.getId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing payment ID"));
        }

        try {
            // Process the webhook and trigger AI flow
            String transactionId = transactionService.handlePaymentFailedWebhook(payload);

            Map<String, Object> response = new HashMap<>();
            response.put("received", true);
            response.put("event", "payment.failed");
            response.put("transactionId", transactionId);
            response.put("status", "AT_RISK");
            response.put("aiAnalysisTriggered", true);
            response.put("decisionStatus", "PENDING_APPROVAL");

            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error processing webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Internal error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process webhook"));
        }
    }
}

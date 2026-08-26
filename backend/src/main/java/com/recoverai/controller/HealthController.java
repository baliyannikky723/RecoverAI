package com.recoverai.controller;

import com.recoverai.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> getHealth() {
        Map<String, Object> details = new HashMap<>();
        details.put("javaVersion", System.getProperty("java.version"));
        details.put("systemUptimeMillis", System.currentTimeMillis());
        details.put("memoryFreeBytes", Runtime.getRuntime().freeMemory());
        details.put("memoryTotalBytes", Runtime.getRuntime().totalMemory());

        HealthResponse response = HealthResponse.builder()
                .status("UP")
                .service("RecoverAI Decision Engine")
                .version("0.0.1-SNAPSHOT")
                .environment(activeProfile)
                .timestamp(Instant.now())
                .details(details)
                .build();

        return ResponseEntity.ok(response);
    }
}

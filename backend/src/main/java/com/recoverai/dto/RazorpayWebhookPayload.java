package com.recoverai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class RazorpayWebhookPayload {

    private String event;
    private Payload payload;

    @Data
    @NoArgsConstructor
    public static class Payload {
        private Payment payment;
    }

    @Data
    @NoArgsConstructor
    public static class Payment {
        private Entity entity;
    }

    @Data
    @NoArgsConstructor
    public static class Entity {
        private String id;
        private BigDecimal amount;
        private String currency;
        private String status;
        
        @JsonProperty("error_code")
        private String errorCode;
        
        @JsonProperty("error_description")
        private String errorDescription;
    }
}

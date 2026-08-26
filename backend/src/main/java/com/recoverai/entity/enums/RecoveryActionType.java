package com.recoverai.entity.enums;

public enum RecoveryActionType {
    RETRY_PAYMENT,
    SEND_PAYMENT_LINK,
    REQUEST_PAYMENT_METHOD_UPDATE,
    SEND_REMINDER,
    ESCALATE_TO_HUMAN,
    STOP_RECOVERY
}

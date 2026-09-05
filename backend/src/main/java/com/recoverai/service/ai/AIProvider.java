package com.recoverai.service.ai;

import com.recoverai.dto.AIRecoveryDecision;
import com.recoverai.entity.Transaction;

public interface AIProvider {
    AIRecoveryDecision generateDecision(Transaction transaction, String recoveryContextJson);
}

-- RecoverAI Core Schema Migration (Phase 2)

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    lifetime_value NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    successful_payment_count INT NOT NULL DEFAULT 0,
    failed_payment_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    failure_reason VARCHAR(50),
    risk_level VARCHAR(20) NOT NULL,
    recovery_priority VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_attempts (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL,
    failure_reason VARCHAR(255),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recovery_actions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    confidence NUMERIC(5, 2),
    expected_recovery_amount NUMERIC(14, 2),
    status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    executed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(36) REFERENCES transactions(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    actor VARCHAR(50) NOT NULL,
    decision VARCHAR(255),
    action VARCHAR(255),
    result VARCHAR(50),
    reason TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_risk ON transactions(risk_level);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_transaction ON payment_attempts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_recovery_transaction ON recovery_actions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_recovery_status ON recovery_actions(status);
CREATE INDEX IF NOT EXISTS idx_audit_transaction ON audit_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

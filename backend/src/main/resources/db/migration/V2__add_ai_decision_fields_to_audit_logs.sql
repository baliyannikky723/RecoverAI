-- Flyway database migration - Add AI Decision fields to audit_logs (Phase 4 Extension)

ALTER TABLE audit_logs ADD COLUMN confidence NUMERIC(5, 4);
ALTER TABLE audit_logs ADD COLUMN expected_recovery_amount NUMERIC(14, 2);
ALTER TABLE audit_logs ADD COLUMN retry_after_hours INT;
ALTER TABLE audit_logs ADD COLUMN risk_level VARCHAR(20);
ALTER TABLE audit_logs ADD COLUMN provider VARCHAR(50);

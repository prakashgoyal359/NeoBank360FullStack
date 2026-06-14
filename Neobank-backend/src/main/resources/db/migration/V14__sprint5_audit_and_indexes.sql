CREATE TABLE IF NOT EXISTS system_audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    endpoint VARCHAR(255),
    http_method VARCHAR(20),
    response_status INT,
    execution_time_ms BIGINT,
    acting_user_id BIGINT,
    acting_username VARCHAR(100),
    event_type VARCHAR(100),
    event_timestamp DATETIME,
    error_message TEXT,
    INDEX idx_audit_timestamp (event_timestamp),
    INDEX idx_audit_user (acting_user_id),
    INDEX idx_audit_endpoint (endpoint)
);

CREATE INDEX idx_accounts_user_active ON accounts (user_id, is_active);
CREATE INDEX idx_transactions_date ON transactions (transaction_date);
CREATE INDEX idx_transactions_account_type_date ON transactions (account_id, transaction_type, transaction_date);
CREATE INDEX idx_bills_user_status_due ON bills (user_id, status, due_date);
CREATE INDEX idx_loan_applications_status_date ON loan_applications (status, applied_at);
CREATE INDEX idx_loan_accounts_user_status ON loan_accounts (user_id, status);
CREATE INDEX idx_loan_repayments_status_due ON loan_repayments (status, due_date);

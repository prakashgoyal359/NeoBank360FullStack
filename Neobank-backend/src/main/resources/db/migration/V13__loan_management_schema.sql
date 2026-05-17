-- =====================================================
-- LOAN MANAGEMENT SYSTEM - DATABASE SCHEMA
-- NeoBank360 Internet Banking System
-- =====================================================

-- -----------------------------------------------------
-- Table: loan_products
-- Stores available loan products offered by the bank
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    loan_type ENUM('PERSONAL', 'HOME', 'AUTO', 'EDUCATION', 'BUSINESS') NOT NULL,
    description TEXT,
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 4) NOT NULL,
    allowed_tenures VARCHAR(100) NOT NULL COMMENT 'Comma-separated tenure options in months',
    min_tenure INT NOT NULL,
    max_tenure INT NOT NULL,
    processing_fee DECIMAL(5, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    CONSTRAINT chk_loan_amount_range CHECK (min_amount > 0 AND max_amount > min_amount),
    CONSTRAINT chk_interest_rate CHECK (interest_rate >= 0 AND interest_rate <= 1),
    INDEX idx_loan_type (loan_type),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table: loan_applications
-- Stores customer loan applications
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    loan_product_id BIGINT NOT NULL,
    requested_amount DECIMAL(15, 2) NOT NULL,
    requested_tenure INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED') DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by BIGINT,
    admin_remarks TEXT,
    rejection_reason TEXT,
    income DECIMAL(15, 2),
    employer_name VARCHAR(100),
    designation VARCHAR(100),
    monthly_income DECIMAL(15, 2),
    existing_emis DECIMAL(15, 2) DEFAULT 0,
    CONSTRAINT chk_requested_amount CHECK (requested_amount > 0),
    CONSTRAINT chk_requested_tenure CHECK (requested_tenure > 0),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_applied_at (applied_at),
    INDEX idx_application_number (application_number),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_product_id) REFERENCES loan_products(id) ON DELETE RESTRICT,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Table: loan_accounts
-- Stores approved loan accounts with disbursement details
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_account_number VARCHAR(20) UNIQUE NOT NULL,
    loan_application_id BIGINT,
    user_id BIGINT NOT NULL,
    loan_product_id BIGINT NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 4) NOT NULL,
    tenure_months INT NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    total_interest DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    disbursed_amount DECIMAL(15, 2),
    disbursed_date DATE,
    first_emi_date DATE,
    last_emi_date DATE,
    remaining_principal DECIMAL(15, 2),
    status ENUM('ACTIVE', 'CLOSED', 'DEFAULTED', 'NPA') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_principal_amount CHECK (principal_amount > 0),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_loan_account_number (loan_account_number),
    FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_product_id) REFERENCES loan_products(id) ON DELETE RESTRICT
);

-- -----------------------------------------------------
-- Table: loan_repayments
-- Stores EMI schedule and repayment records
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_repayments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_account_id BIGINT NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    emi_amount DECIMAL(15, 2) NOT NULL,
    principal_component DECIMAL(15, 2) NOT NULL,
    interest_component DECIMAL(15, 2) NOT NULL,
    remaining_principal DECIMAL(15, 2),
    status ENUM('PENDING', 'PAID', 'OVERDUE', 'PARTIAL') DEFAULT 'PENDING',
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    paid_date TIMESTAMP,
    payment_reference VARCHAR(50),
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_emi_amount CHECK (emi_amount > 0),
    INDEX idx_loan_account_id (loan_account_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    UNIQUE KEY uk_loan_installment (loan_account_id, installment_number),
    FOREIGN KEY (loan_account_id) REFERENCES loan_accounts(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table: loan_transactions
-- Stores loan-related transactions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS loan_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_account_id BIGINT NOT NULL,
    transaction_type ENUM('DISBURSEMENT', 'EMI_PAYMENT', 'PREPAYMENT', 'FORECLOSURE', 'PENALTY') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    running_balance DECIMAL(15, 2),
    FOREIGN KEY (loan_account_id) REFERENCES loan_accounts(id) ON DELETE CASCADE,
    INDEX idx_loan_account_id (loan_account_id),
    INDEX idx_transaction_date (transaction_date)
);

-- -----------------------------------------------------
-- Seed data: Default Loan Products
-- -----------------------------------------------------
INSERT INTO loan_products (product_name, loan_type, description, min_amount, max_amount, interest_rate, allowed_tenures, min_tenure, max_tenure, processing_fee, is_active, created_by) VALUES
('Personal Loan Standard', 'PERSONAL', 'Unsecured personal loan for any purpose with flexible tenure', 50000.00, 5000000.00, 0.10, '12,24,36,48,60', 12, 60, 0.01, TRUE, NULL),
('Personal Loan Premium', 'PERSONAL', 'Premium personal loan with lower interest rates for existing customers', 100000.00, 10000000.00, 0.085, '12,24,36,48,60,72,84', 12, 84, 0.005, TRUE, NULL),
('Home Loan Basic', 'HOME', 'Home loan for purchase of new property', 500000.00, 50000000.00, 0.065, '60,120,180,240,300', 60, 300, 0.005, TRUE, NULL),
('Home Loan Top-Up', 'HOME', 'Top-up loan on existing home loan', 100000.00, 10000000.00, 0.075, '12,24,36,48,60', 12, 60, 0.01, TRUE, NULL),
('Auto Loan New Car', 'AUTO', 'Loan for purchase of new car', 100000.00, 10000000.00, 0.085, '12,24,36,48,60,72,84', 12, 84, 0.01, TRUE, NULL),
('Auto Loan Used Car', 'AUTO', 'Loan for purchase of pre-owned car', 50000.00, 5000000.00, 0.12, '12,36,48,60', 12, 60, 0.02, TRUE, NULL),
('Education Loan India', 'EDUCATION', 'Loan for higher education in India', 50000.00, 20000000.00, 0.08, '60,120,180', 60, 180, 0.005, TRUE, NULL),
('Education Loan Abroad', 'EDUCATION', 'Loan for overseas education', 500000.00, 50000000.00, 0.075, '60,120,180,240', 60, 240, 0.005, TRUE, NULL),
('Business Loan SME', 'BUSINESS', 'Working capital and expansion loan for small businesses', 100000.00, 10000000.00, 0.12, '12,24,36,48,60', 12, 60, 0.015, TRUE, NULL),
('Business Loan Enterprise', 'BUSINESS', 'Large scale business loan for enterprises', 5000000.00, 100000000.00, 0.10, '24,36,48,60,72', 24, 72, 0.01, TRUE, NULL);
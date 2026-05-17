CREATE DATABASE IF NOT EXISTS `neobank_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `neobank_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `full_name` VARCHAR(100) NOT NULL,
  `mobile_number` VARCHAR(20),
  `aadhaar_number` VARCHAR(20),
  `pan_number` VARCHAR(20),
  `role` VARCHAR(20) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `address` VARCHAR(500),
  `gender` VARCHAR(20),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `account_number` VARCHAR(20) NOT NULL UNIQUE,
  `account_type` VARCHAR(20) NOT NULL,
  `balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_accounts_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `account_id` BIGINT NOT NULL,
  `transaction_type` VARCHAR(20) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `description` VARCHAR(500),
  `category` VARCHAR(50),
  `balance_after` DECIMAL(15,2),
  `transaction_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reference_number` VARCHAR(50),
  CONSTRAINT `fk_transactions_account` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE,
  INDEX `idx_transactions_account_date` (`account_id`, `transaction_date`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `account_opening_forms` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `mobile_number` VARCHAR(20) NOT NULL,
  `aadhaar_number` VARCHAR(20) NOT NULL UNIQUE,
  `pan_number` VARCHAR(20) NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `account_type` VARCHAR(20) NOT NULL,
  `gender` VARCHAR(20),
  `aadhaar_card_path` VARCHAR(1024),
  `pan_card_path` VARCHAR(1024),
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME NULL,
  `rejection_reason` VARCHAR(500),
  INDEX `idx_account_opening_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `bills` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `biller_name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `due_date` DATE NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `description` VARCHAR(500),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `paid_at` DATETIME NULL,
  CONSTRAINT `fk_bills_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_bills_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `budgets` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `limit_amount` DECIMAL(15,2) NOT NULL,
  `budget_month` VARCHAR(7) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_budgets_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_budget_user_category_month` (`user_id`, `category`, `budget_month`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `rewards` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL UNIQUE,
  `points_balance` BIGINT NOT NULL DEFAULT 0,
  `last_updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rewards_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `reward_history` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `reward_id` BIGINT NOT NULL,
  `points_earned` BIGINT NOT NULL,
  `description` VARCHAR(200),
  `earned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reward_history_reward` FOREIGN KEY (`reward_id`) REFERENCES `rewards`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `money_transfers` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` BIGINT NOT NULL,
  `receiver_account_id` BIGINT NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `description` VARCHAR(500),
  `status` VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
  `transferred_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_transfers_sender` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transfers_receiver_account` FOREIGN KEY (`receiver_account_id`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

package com.neobank.repository;

import com.neobank.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface AdminDashboardRepository extends JpaRepository<User, Long> {

    interface PendingApprovalProjection {
        Long getId();
        String getModule();
        String getApplicantName();
        String getProductName();
        BigDecimal getRequestedAmount();
        java.time.LocalDateTime getApplicationDate();
        String getStatus();
    }

    interface UserActivityProjection {
        Long getTransactionId();
        String getAccountNumber();
        String getTransactionType();
        BigDecimal getAmount();
        String getCategory();
        String getDescription();
        java.time.LocalDateTime getTransactionDate();
    }

    long countByIsActiveTrue();

    @Query("SELECT COUNT(la) FROM LoanAccount la")
    long countLoans();

    @Query("SELECT COUNT(t) FROM Transaction t")
    long countTransactions();

    @Query("SELECT COUNT(la) FROM LoanApplication la WHERE la.status = 'PENDING'")
    long countPendingLoanApprovals();

    @Query("""
            SELECT COALESCE(SUM(CASE WHEN t.transactionType = 'CREDIT' THEN t.amount ELSE 0 END), 0)
            FROM Transaction t
            WHERE t.account.isActive = true
            """)
    BigDecimal totalPlatformIncome();

    @Query("""
            SELECT COALESCE(SUM(CASE WHEN t.transactionType = 'DEBIT' THEN t.amount ELSE 0 END), 0)
            FROM Transaction t
            WHERE t.account.isActive = true
            """)
    BigDecimal totalPlatformExpense();

    @Query(value = """
            SELECT la.id AS id,
                   'LOAN' AS module,
                   u.full_name AS applicantName,
                   lp.product_name AS productName,
                   la.requested_amount AS requestedAmount,
                   la.applied_at AS applicationDate,
                   la.status AS status
            FROM loan_applications la
            JOIN users u ON u.id = la.user_id
            JOIN loan_products lp ON lp.id = la.loan_product_id
            WHERE la.status = 'PENDING'
              AND (:module IS NULL OR :module = '' OR :module = 'LOAN')
            ORDER BY la.applied_at ASC
            """, nativeQuery = true)
    List<PendingApprovalProjection> findPendingApprovals(@Param("module") String module);

    @Query(value = """
            SELECT t.id AS transactionId,
                   a.account_number AS accountNumber,
                   t.transaction_type AS transactionType,
                   t.amount AS amount,
                   t.category AS category,
                   t.description AS description,
                   t.transaction_date AS transactionDate
            FROM transactions t
            JOIN accounts a ON a.id = t.account_id
            WHERE a.user_id = :userId
            ORDER BY t.transaction_date DESC
            """, nativeQuery = true)
    Page<UserActivityProjection> findUserActivity(@Param("userId") Long userId, Pageable pageable);
}

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

    interface AnalyticsPointProjection {
        String getLabel();
        BigDecimal getValue();
        BigDecimal getSecondaryValue();
    }

    interface TrendProjection {
        String getMonthKey();
        BigDecimal getTotalIncome();
        BigDecimal getTotalExpense();
    }

    long countByIsActiveTrue();

    @Query("SELECT COUNT(la) FROM LoanAccount la")
    long countLoans();

    @Query("SELECT COUNT(t) FROM Transaction t")
    long countTransactions();

    @Query("SELECT COUNT(la) FROM LoanApplication la WHERE la.status = 'PENDING'")
    long countPendingLoanApprovals();

    @Query("SELECT COUNT(la) FROM LoanApplication la WHERE la.status = 'APPROVED'")
    long countApprovedLoanApprovals();

    @Query("SELECT COUNT(la) FROM LoanApplication la WHERE la.status = 'REJECTED'")
    long countRejectedLoanApprovals();

    @Query("""
            SELECT COALESCE(SUM(la.disbursedAmount), 0)
            FROM LoanAccount la
            """)
    BigDecimal totalDisbursed();

    @Query("""
            SELECT COALESCE(SUM(la.remainingPrincipal), 0)
            FROM LoanAccount la
            WHERE la.status = 'ACTIVE'
            """)
    BigDecimal totalOutstandingPrincipal();

    @Query("""
            SELECT COUNT(t)
            FROM Transaction t
            WHERE t.transactionDate >= :startDate
            """)
    long countTransactionsSince(@Param("startDate") java.time.LocalDateTime startDate);

    @Query("""
            SELECT COALESCE(SUM(CASE WHEN t.transactionType = 'CREDIT' THEN t.amount ELSE 0 END), 0)
            FROM Transaction t
            WHERE t.transactionDate >= :startDate
              AND t.account.isActive = true
            """)
    BigDecimal totalCreditSince(@Param("startDate") java.time.LocalDateTime startDate);

    @Query("""
            SELECT COALESCE(SUM(CASE WHEN t.transactionType = 'DEBIT' THEN t.amount ELSE 0 END), 0)
            FROM Transaction t
            WHERE t.transactionDate >= :startDate
              AND t.account.isActive = true
            """)
    BigDecimal totalDebitSince(@Param("startDate") java.time.LocalDateTime startDate);

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
            SELECT DATE_FORMAT(t.transaction_date, '%Y-%m-%d') AS monthKey,
                   COALESCE(SUM(CASE WHEN t.transaction_type = 'CREDIT' THEN t.amount ELSE 0 END), 0) AS totalIncome,
                   COALESCE(SUM(CASE WHEN t.transaction_type = 'DEBIT' THEN t.amount ELSE 0 END), 0) AS totalExpense
            FROM transactions t
            JOIN accounts a ON a.id = t.account_id
            WHERE a.is_active = true
              AND t.transaction_date >= :startDate
            GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m-%d')
            ORDER BY monthKey
            """, nativeQuery = true)
    List<TrendProjection> findTransactionTrendSince(@Param("startDate") java.time.LocalDateTime startDate);

    @Query(value = """
            SELECT COALESCE(t.category, 'Other') AS label,
                   COALESCE(SUM(t.amount), 0) AS value,
                   COUNT(t.id) AS secondaryValue
            FROM transactions t
            JOIN accounts a ON a.id = t.account_id
            WHERE a.is_active = true
              AND t.transaction_type = 'DEBIT'
              AND t.transaction_date >= :startDate
            GROUP BY COALESCE(t.category, 'Other')
            ORDER BY value DESC
            """, nativeQuery = true)
    List<AnalyticsPointProjection> findTransactionCategoryBreakdownSince(@Param("startDate") java.time.LocalDateTime startDate);

    @Query(value = """
            SELECT la.status AS label,
                   COUNT(la.id) AS value,
                   COALESCE(SUM(la.requested_amount), 0) AS secondaryValue
            FROM loan_applications la
            GROUP BY la.status
            ORDER BY label
            """, nativeQuery = true)
    List<AnalyticsPointProjection> findLoanStatusDistribution();

    @Query(value = """
            SELECT la.status AS label,
                   COUNT(la.id) AS value,
                   COALESCE(SUM(la.remaining_principal), 0) AS secondaryValue
            FROM loan_accounts la
            GROUP BY la.status
            ORDER BY label
            """, nativeQuery = true)
    List<AnalyticsPointProjection> findLoanAccountStatusDistribution();

    @Query(value = """
            SELECT (
                SELECT COUNT(*)
                FROM loan_applications la
                WHERE la.processed_at IS NOT NULL
                  AND la.processed_at >= :startDate
            ) + (
                SELECT COUNT(*)
                FROM account_opening_forms aof
                WHERE aof.submitted_at >= :startDate
                   OR (aof.approved_at IS NOT NULL AND aof.approved_at >= :startDate)
            ) AS auditEvents
            """, nativeQuery = true)
    long countDerivedAuditEventsSince(@Param("startDate") java.time.LocalDateTime startDate);

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

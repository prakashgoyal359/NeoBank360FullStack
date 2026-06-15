package com.neobank.repository;

import com.neobank.entity.Transaction;

import com.neobank.entity.TransactionType;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

import java.time.LocalDateTime;

import java.util.List;

@Repository

public interface InsightsRepository extends JpaRepository<Transaction, Long> {

	interface MonthlyTrendProjection {

		String getMonthKey();

		BigDecimal getTotalIncome();

		BigDecimal getTotalExpense();

	}

	interface AnalyticsPointProjection {

		String getLabel();

		BigDecimal getValue();

		BigDecimal getSecondaryValue();

	}

	@Query("""

			SELECT COALESCE(SUM(t.amount), 0)

			FROM Transaction t

			WHERE t.account.user.id = :userId

			AND t.account.isActive = true

			AND t.transactionType = :type

			""")

	BigDecimal sumByUserAndType(@Param("userId") Long userId,

			@Param("type") TransactionType type);

	@Query(value = """

			SELECT DATE_FORMAT(t.transaction_date, '%Y-%m') AS monthKey,

			COALESCE(SUM(CASE WHEN t.transaction_type = 'CREDIT' THEN t.amount ELSE 0 END), 0) AS totalIncome,

			COALESCE(SUM(CASE WHEN t.transaction_type = 'DEBIT' THEN t.amount ELSE 0 END), 0) AS totalExpense

			FROM transactions t

			JOIN accounts a ON a.id = t.account_id

			WHERE a.user_id = :userId

			AND a.is_active = true

			AND t.transaction_date >= :startDate

			GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m')

			ORDER BY monthKey

			""", nativeQuery = true)

	List<MonthlyTrendProjection> findSixMonthTrend(@Param("userId") Long userId,

			@Param("startDate") LocalDateTime startDate);

	@Query(value = """

			SELECT COALESCE(t.category, 'Other') AS label,

			COALESCE(SUM(t.amount), 0) AS value,

			COUNT(t.id) AS secondaryValue

			FROM transactions t

			JOIN accounts a ON a.id = t.account_id

			WHERE a.user_id = :userId

			AND a.is_active = true

			AND t.transaction_type = 'DEBIT'

			AND t.transaction_date >= :startDate

			GROUP BY COALESCE(t.category, 'Other')

			ORDER BY value DESC

			""", nativeQuery = true)

	List<AnalyticsPointProjection> findSpendingBreakdown(@Param("userId") Long userId,

			@Param("startDate") LocalDateTime startDate);

// ✅ ✅ ✅ FIXED QUERY (IMPORTANT)

	@Query(value = """

			SELECT

			b.category AS label,

			COALESCE(b.limit_amount, 0) AS value,

			COALESCE(SUM(t.amount), 0) AS secondaryValue

			FROM budgets b

			LEFT JOIN transactions t

			ON COALESCE(t.category, 'Other') = b.category

			AND t.transaction_type = 'DEBIT'

			AND DATE_FORMAT(t.transaction_date, '%Y-%m') = :monthKey

			AND t.account_id IN (

			SELECT a.id FROM accounts a

			WHERE a.user_id = :userId

			AND a.is_active = true

			)

			WHERE b.user_id = :userId

			AND DATE_FORMAT(b.budget_month, '%Y-%m') = :monthKey

			GROUP BY b.category, b.limit_amount

			ORDER BY b.category

			""", nativeQuery = true)

	List<AnalyticsPointProjection> findBudgetVsActual(@Param("userId") Long userId,

			@Param("monthKey") String monthKey);

	@Query(value = """

			SELECT DATE_FORMAT(t.transaction_date, '%Y-%m') AS label,

			COALESCE(SUM(CASE WHEN t.transaction_type = 'CREDIT' THEN t.amount ELSE -t.amount END), 0) AS value,

			0 AS secondaryValue

			FROM transactions t

			JOIN accounts a ON a.id = t.account_id

			WHERE a.user_id = :userId

			AND a.is_active = true

			AND t.transaction_date >= :startDate

			GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m')

			ORDER BY label

			""", nativeQuery = true)

	List<AnalyticsPointProjection> findMonthlyNetMovement(@Param("userId") Long userId,

			@Param("startDate") LocalDateTime startDate);

	@Query(value = """

			SELECT DATE_FORMAT(rh.earned_at, '%Y-%m') AS label,

			COALESCE(SUM(rh.points_earned), 0) AS value,

			COUNT(rh.id) AS secondaryValue

			FROM reward_history rh

			JOIN rewards r ON r.id = rh.reward_id

			WHERE r.user_id = :userId

			AND rh.earned_at >= :startDate

			GROUP BY DATE_FORMAT(rh.earned_at, '%Y-%m')

			ORDER BY label

			""", nativeQuery = true)

	List<AnalyticsPointProjection> findRewardGrowth(@Param("userId") Long userId,

			@Param("startDate") LocalDateTime startDate);

	@Query(value = """

			SELECT COALESCE(SUM(a.balance), 0)

			FROM accounts a

			WHERE a.user_id = :userId

			AND a.is_active = true

			""", nativeQuery = true)

	BigDecimal sumActiveAccountBalance(@Param("userId") Long userId);

	@Query(value = """

			SELECT COALESCE(SUM(la.remaining_principal), 0)

			FROM loan_accounts la

			WHERE la.user_id = :userId

			AND la.status = 'ACTIVE'

			""", nativeQuery = true)

	BigDecimal sumOutstandingLoans(@Param("userId") Long userId);

	@Query(value = """

			SELECT COALESCE(MAX(r.points_balance), 0)

			FROM rewards r

			WHERE r.user_id = :userId

			""", nativeQuery = true)

	Long rewardBalance(@Param("userId") Long userId);

	@Query(value = """

			SELECT DATE_FORMAT(lr.due_date, '%Y-%m') AS label,

			COALESCE(SUM(lr.remaining_principal), 0) AS value,

			COALESCE(SUM(lr.emi_amount), 0) AS secondaryValue

			FROM loan_repayments lr

			JOIN loan_accounts la ON la.id = lr.loan_account_id

			WHERE la.user_id = :userId

			AND lr.status IN ('PENDING', 'OVERDUE')

			GROUP BY DATE_FORMAT(lr.due_date, '%Y-%m')

			ORDER BY label

			""", nativeQuery = true)

	List<AnalyticsPointProjection> findLoanPayoffForecast(@Param("userId") Long userId);

}
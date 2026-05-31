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

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.account.user.id = :userId
              AND t.account.isActive = true
              AND t.transactionType = :type
            """)
    BigDecimal sumByUserAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

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
}

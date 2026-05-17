package com.neobank.repository;

import com.neobank.entity.LoanRepayment;
import com.neobank.entity.LoanRepayment.RepaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepaymentRepository extends JpaRepository<LoanRepayment, Long> {
    List<LoanRepayment> findByLoanAccountId(Long loanAccountId);

    List<LoanRepayment> findByLoanAccountIdOrderByInstallmentNumberAsc(Long loanAccountId);

    List<LoanRepayment> findByLoanAccountIdAndStatus(Long loanAccountId, RepaymentStatus status);

    Optional<LoanRepayment> findByLoanAccountIdAndInstallmentNumber(Long loanAccountId, Integer installmentNumber);

    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.loanAccount.user.id = :userId ORDER BY lr.dueDate ASC")
    List<LoanRepayment> findByUserIdOrderByDueDate(@Param("userId") Long userId);

    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.loanAccount.user.id = :userId AND lr.status = 'PENDING' ORDER BY lr.dueDate ASC")
    List<LoanRepayment> findPendingByUserId(@Param("userId") Long userId);

    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.status = 'PENDING' AND lr.dueDate < :currentDate")
    List<LoanRepayment> findOverdueRepayments(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.loanAccount.id = :loanAccountId AND lr.status = 'PENDING' AND lr.dueDate < :currentDate")
    List<LoanRepayment> findOverdueByLoanAccountId(@Param("loanAccountId") Long loanAccountId, @Param("currentDate") LocalDate currentDate);

    @Query("SELECT COUNT(lr) FROM LoanRepayment lr WHERE lr.loanAccount.id = :loanAccountId AND lr.status = 'PAID'")
    long countPaidByLoanAccountId(@Param("loanAccountId") Long loanAccountId);

    @Query("SELECT SUM(lr.emiAmount) FROM LoanRepayment lr WHERE lr.loanAccount.user.id = :userId AND lr.status = 'PENDING'")
    java.math.BigDecimal getTotalPendingEmiByUserId(@Param("userId") Long userId);

    @Query("SELECT lr FROM LoanRepayment lr WHERE lr.loanAccount.user.id = :userId AND lr.dueDate BETWEEN :startDate AND :endDate AND lr.status = 'PENDING'")
    List<LoanRepayment> findUpcomingByUserId(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
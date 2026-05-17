package com.neobank.repository;

import com.neobank.entity.LoanAccount;
import com.neobank.entity.LoanAccount.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanAccountRepository extends JpaRepository<LoanAccount, Long> {
    Optional<LoanAccount> findByLoanAccountNumber(String loanAccountNumber);

    List<LoanAccount> findByUserId(Long userId);

    List<LoanAccount> findByUserIdAndStatus(Long userId, LoanStatus status);

    List<LoanAccount> findByStatus(LoanStatus status);

    @Query("SELECT la FROM LoanAccount la WHERE la.user.id = :userId AND la.status = 'ACTIVE'")
    List<LoanAccount> findActiveLoansByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(la) FROM LoanAccount la WHERE la.status = :status")
    long countByStatus(@Param("status") LoanStatus status);

    @Query("SELECT SUM(la.remainingPrincipal) FROM LoanAccount la WHERE la.user.id = :userId AND la.status = 'ACTIVE'")
    java.math.BigDecimal getTotalOutstandingByUserId(@Param("userId") Long userId);
}
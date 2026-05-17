package com.neobank.repository;

import com.neobank.entity.LoanApplication;
import com.neobank.entity.LoanApplication.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    Optional<LoanApplication> findByApplicationNumber(String applicationNumber);

    List<LoanApplication> findByUserId(Long userId);

    List<LoanApplication> findByUserIdAndStatus(Long userId, ApplicationStatus status);

    List<LoanApplication> findByStatus(ApplicationStatus status);

    @Query("SELECT la FROM LoanApplication la WHERE la.status = :status ORDER BY la.appliedAt DESC")
    List<LoanApplication> findByStatusOrderByAppliedAtDesc(@Param("status") ApplicationStatus status);

    @Query("SELECT la FROM LoanApplication la WHERE la.user.id = :userId AND la.status = 'PENDING'")
    List<LoanApplication> findPendingApplicationByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(la) FROM LoanApplication la WHERE la.status = :status")
    long countByStatus(@Param("status") ApplicationStatus status);
}
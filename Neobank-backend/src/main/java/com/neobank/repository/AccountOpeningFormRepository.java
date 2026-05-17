package com.neobank.repository;

import com.neobank.entity.AccountOpeningForm;
import com.neobank.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountOpeningFormRepository extends JpaRepository<AccountOpeningForm, Long> {
    List<AccountOpeningForm> findByStatus(ApplicationStatus status);
    Optional<AccountOpeningForm> findByEmail(String email);
    Optional<AccountOpeningForm> findByAadhaarNumber(String aadhaarNumber);
}

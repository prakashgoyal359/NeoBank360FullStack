package com.neobank.repository;

import com.neobank.entity.LoanProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanProductRepository extends JpaRepository<LoanProduct, Long> {
    List<LoanProduct> findByIsActiveTrue();
    List<LoanProduct> findByLoanType(LoanProduct.LoanType loanType);
    List<LoanProduct> findByIsActiveTrueAndLoanType(LoanProduct.LoanType loanType);
}
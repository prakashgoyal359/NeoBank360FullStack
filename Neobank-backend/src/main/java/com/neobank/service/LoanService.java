package com.neobank.service;

import com.neobank.dto.*;

import java.math.BigDecimal;
import java.util.List;

public interface LoanService {

    // Loan Products (Admin)
    LoanProductDTO createLoanProduct(LoanProductRequest request, Long adminId);
    LoanProductDTO updateLoanProduct(Long id, LoanProductRequest request);
    void deleteLoanProduct(Long id);
    LoanProductDTO getLoanProductById(Long id);
    List<LoanProductDTO> getAllLoanProducts();
    List<LoanProductDTO> getActiveLoanProducts();

    // Loan Applications
    LoanApplicationDTO applyForLoan(LoanApplicationRequest request, Long userId);
    List<LoanApplicationDTO> getUserLoanApplications(Long userId);
    LoanApplicationDTO getLoanApplicationById(Long applicationId);

    // Admin Loan Applications
    List<LoanApplicationDTO> getAllLoanApplications();
    List<LoanApplicationDTO> getPendingLoanApplications();
    List<LoanApplicationDTO> getApprovedLoanApplications();
    List<LoanApplicationDTO> getRejectedLoanApplications();
    LoanApplicationDTO processLoanApplication(Long applicationId, LoanDecisionRequest decision, Long adminId);

    // Loan Accounts
    List<LoanAccountDTO> getUserLoanAccounts(Long userId);
    LoanAccountDTO getLoanAccountById(Long accountId);

    // Repayments
    List<LoanRepaymentDTO> getRepaymentsByLoanAccount(Long loanAccountId);
    List<LoanRepaymentDTO> getUserRepayments(Long userId);
    LoanRepaymentDTO payRepayment(Long loanAccountId, Long repaymentId);
    void checkAndUpdateOverdueRepayments();

    // Analytics
    LoanDashboardDTO getAdminDashboardStats();
    LoanDashboardDTO getUserDashboardStats(Long userId);
}
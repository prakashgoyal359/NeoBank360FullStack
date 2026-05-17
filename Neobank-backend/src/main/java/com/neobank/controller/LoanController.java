package com.neobank.controller;

import com.neobank.dto.*;
import com.neobank.security.SecurityUtils;
import com.neobank.service.LoanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@Tag(name = "Loan Management", description = "Loan management APIs")
@SecurityRequirement(name = "bearerAuth")
public class LoanController {

    private final LoanService loanService;
    private final SecurityUtils securityUtils;

    // ==================== LOAN PRODUCTS ====================

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create loan product", description = "Create a new loan product (Admin only)")
    public ResponseEntity<LoanProductDTO> createLoanProduct(@Valid @RequestBody LoanProductRequest request) {
        Long adminId = securityUtils.getCurrentUser().getId();
        LoanProductDTO product = loanService.createLoanProduct(request, adminId);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products")
    @Operation(summary = "Get all loan products", description = "Get all loan products")
    public ResponseEntity<List<LoanProductDTO>> getAllLoanProducts() {
        return ResponseEntity.ok(loanService.getAllLoanProducts());
    }

    @GetMapping("/products/active")
    @Operation(summary = "Get active loan products", description = "Get all active loan products available for application")
    public ResponseEntity<List<LoanProductDTO>> getActiveLoanProducts() {
        return ResponseEntity.ok(loanService.getActiveLoanProducts());
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get loan product by ID", description = "Get a specific loan product")
    public ResponseEntity<LoanProductDTO> getLoanProductById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanProductById(id));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update loan product", description = "Update an existing loan product (Admin only)")
    public ResponseEntity<LoanProductDTO> updateLoanProduct(@PathVariable Long id, @Valid @RequestBody LoanProductRequest request) {
        return ResponseEntity.ok(loanService.updateLoanProduct(id, request));
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete loan product", description = "Soft delete a loan product (Admin only)")
    public ResponseEntity<Void> deleteLoanProduct(@PathVariable Long id) {
        loanService.deleteLoanProduct(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== LOAN APPLICATIONS ====================

    @PostMapping("/apply")
    @Operation(summary = "Apply for loan", description = "Submit a loan application")
    public ResponseEntity<LoanApplicationDTO> applyForLoan(@Valid @RequestBody LoanApplicationRequest request) {
        Long userId = securityUtils.getCurrentUser().getId();
        LoanApplicationDTO application = loanService.applyForLoan(request, userId);
        return ResponseEntity.ok(application);
    }

    @GetMapping("/my-applications")
    @Operation(summary = "Get my loan applications", description = "Get all loan applications for current user")
    public ResponseEntity<List<LoanApplicationDTO>> getMyLoanApplications() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(loanService.getUserLoanApplications(userId));
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Get loan application by ID", description = "Get a specific loan application")
    public ResponseEntity<LoanApplicationDTO> getLoanApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanApplicationById(id));
    }

    // ==================== ADMIN LOAN MANAGEMENT ====================

    @GetMapping("/admin/applications")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all loan applications", description = "Get all loan applications (Admin only)")
    public ResponseEntity<List<LoanApplicationDTO>> getAllLoanApplications() {
        return ResponseEntity.ok(loanService.getAllLoanApplications());
    }

    @GetMapping("/admin/applications/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending applications", description = "Get all pending loan applications (Admin only)")
    public ResponseEntity<List<LoanApplicationDTO>> getPendingLoanApplications() {
        return ResponseEntity.ok(loanService.getPendingLoanApplications());
    }

    @GetMapping("/admin/applications/approved")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get approved applications", description = "Get all approved loan applications (Admin only)")
    public ResponseEntity<List<LoanApplicationDTO>> getApprovedLoanApplications() {
        return ResponseEntity.ok(loanService.getApprovedLoanApplications());
    }

    @GetMapping("/admin/applications/rejected")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get rejected applications", description = "Get all rejected loan applications (Admin only)")
    public ResponseEntity<List<LoanApplicationDTO>> getRejectedLoanApplications() {
        return ResponseEntity.ok(loanService.getRejectedLoanApplications());
    }

    @PutMapping("/admin/applications/{id}/decision")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Process loan application", description = "Approve or reject a loan application (Admin only)")
    public ResponseEntity<LoanApplicationDTO> processLoanApplication(
            @PathVariable Long id,
            @Valid @RequestBody LoanDecisionRequest decision) {
        Long adminId = securityUtils.getCurrentUser().getId();
        LoanApplicationDTO result = loanService.processLoanApplication(id, decision, adminId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard stats", description = "Get loan management statistics for admin dashboard")
    public ResponseEntity<LoanDashboardDTO> getAdminDashboardStats() {
        return ResponseEntity.ok(loanService.getAdminDashboardStats());
    }

    // ==================== LOAN ACCOUNTS ====================

    @GetMapping("/my-accounts")
    @Operation(summary = "Get my loan accounts", description = "Get all loan accounts for current user")
    public ResponseEntity<List<LoanAccountDTO>> getMyLoanAccounts() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(loanService.getUserLoanAccounts(userId));
    }

    @GetMapping("/accounts/{id}")
    @Operation(summary = "Get loan account by ID", description = "Get a specific loan account")
    public ResponseEntity<LoanAccountDTO> getLoanAccountById(@PathVariable Long id) {
        return ResponseEntity.ok(loanService.getLoanAccountById(id));
    }

    // ==================== REPAYMENTS ====================

    @GetMapping("/{loanAccountId}/repayments")
    @Operation(summary = "Get loan repayments", description = "Get repayment schedule for a loan account")
    public ResponseEntity<List<LoanRepaymentDTO>> getRepayments(@PathVariable Long loanAccountId) {
        return ResponseEntity.ok(loanService.getRepaymentsByLoanAccount(loanAccountId));
    }

    @GetMapping("/my-repayments")
    @Operation(summary = "Get my repayments", description = "Get all repayments for current user")
    public ResponseEntity<List<LoanRepaymentDTO>> getMyRepayments() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(loanService.getUserRepayments(userId));
    }

    @PatchMapping("/{loanAccountId}/repayments/{repaymentId}/pay")
    @Operation(summary = "Pay repayment", description = "Pay an EMI installment")
    public ResponseEntity<LoanRepaymentDTO> payRepayment(
            @PathVariable Long loanAccountId,
            @PathVariable Long repaymentId) {
        LoanRepaymentDTO result = loanService.payRepayment(loanAccountId, repaymentId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get user loan dashboard", description = "Get loan statistics for user dashboard")
    public ResponseEntity<LoanDashboardDTO> getUserDashboardStats() {
        Long userId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(loanService.getUserDashboardStats(userId));
    }
}
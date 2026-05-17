package com.neobank.service.impl;

import com.neobank.dto.*;
import com.neobank.entity.*;
import com.neobank.entity.LoanApplication.ApplicationStatus;
import com.neobank.entity.LoanAccount.LoanStatus;
import com.neobank.entity.LoanRepayment.RepaymentStatus;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.*;
import com.neobank.repository.UserRepository;
import com.neobank.service.LoanService;
import com.neobank.util.EmiCalculatorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanServiceImpl implements LoanService {

    private final LoanProductRepository loanProductRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanAccountRepository loanAccountRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter ACCOUNT_NUMBER_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    // ==================== LOAN PRODUCTS ====================

    @Override
    @Transactional
    public LoanProductDTO createLoanProduct(LoanProductRequest request, Long adminId) {
        LoanProduct product = LoanProduct.builder()
                .productName(request.getProductName())
                .loanType(request.getLoanType())
                .description(request.getDescription())
                .minAmount(request.getMinAmount())
                .maxAmount(request.getMaxAmount())
                .interestRate(request.getInterestRate())
                .allowedTenures(request.getAllowedTenures())
                .minTenure(request.getMinTenure())
                .maxTenure(request.getMaxTenure())
                .processingFee(request.getProcessingFee() != null ? request.getProcessingFee() : BigDecimal.ZERO)
                .isActive(true)
                .build();

        if (adminId != null) {
            userRepository.findById(adminId).ifPresent(product::setCreatedBy);
        }

        product = loanProductRepository.save(product);
        return mapProductToDTO(product);
    }

    @Override
    @Transactional
    public LoanProductDTO updateLoanProduct(Long id, LoanProductRequest request) {
        LoanProduct product = loanProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan product not found"));

        product.setProductName(request.getProductName());
        product.setLoanType(request.getLoanType());
        product.setDescription(request.getDescription());
        product.setMinAmount(request.getMinAmount());
        product.setMaxAmount(request.getMaxAmount());
        product.setInterestRate(request.getInterestRate());
        product.setAllowedTenures(request.getAllowedTenures());
        product.setMinTenure(request.getMinTenure());
        product.setMaxTenure(request.getMaxTenure());
        if (request.getProcessingFee() != null) {
            product.setProcessingFee(request.getProcessingFee());
        }

        product = loanProductRepository.save(product);
        return mapProductToDTO(product);
    }

    @Override
    @Transactional
    public void deleteLoanProduct(Long id) {
        LoanProduct product = loanProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan product not found"));
        product.setIsActive(false);
        loanProductRepository.save(product);
    }

    @Override
    public LoanProductDTO getLoanProductById(Long id) {
        LoanProduct product = loanProductRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan product not found"));
        return mapProductToDTO(product);
    }

    @Override
    public List<LoanProductDTO> getAllLoanProducts() {
        return loanProductRepository.findAll().stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanProductDTO> getActiveLoanProducts() {
        return loanProductRepository.findByIsActiveTrue().stream()
                .map(this::mapProductToDTO)
                .collect(Collectors.toList());
    }

    // ==================== LOAN APPLICATIONS ====================

    @Override
    @Transactional
    public LoanApplicationDTO applyForLoan(LoanApplicationRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LoanProduct product = loanProductRepository.findById(request.getLoanProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan product not found"));

        if (!product.getIsActive()) {
            throw new BadRequestException("This loan product is not currently available");
        }

        // Check for existing pending application
        List<LoanApplication> pendingApplications = loanApplicationRepository.findPendingApplicationByUserId(userId);
        if (!pendingApplications.isEmpty()) {
            throw new BadRequestException("You already have a pending loan application. Please wait for it to be processed.");
        }

        // Validate amount
        if (request.getRequestedAmount().compareTo(product.getMinAmount()) < 0 ||
                request.getRequestedAmount().compareTo(product.getMaxAmount()) > 0) {
            throw new BadRequestException("Requested amount must be between " + product.getMinAmount() +
                    " and " + product.getMaxAmount());
        }

        // Validate tenure
        List<Integer> allowedTenures = parseTenures(product.getAllowedTenures());
        if (!allowedTenures.contains(request.getRequestedTenure())) {
            throw new BadRequestException("Selected tenure is not allowed for this product. Allowed tenures: " + allowedTenures);
        }

        String applicationNumber = generateApplicationNumber();

        LoanApplication application = LoanApplication.builder()
                .applicationNumber(applicationNumber)
                .user(user)
                .loanProduct(product)
                .requestedAmount(request.getRequestedAmount())
                .requestedTenure(request.getRequestedTenure())
                .status(ApplicationStatus.PENDING)
                .income(request.getIncome())
                .employerName(request.getEmployerName())
                .designation(request.getDesignation())
                .monthlyIncome(request.getMonthlyIncome())
                .existingEmis(request.getExistingEmis() != null ? request.getExistingEmis() : BigDecimal.ZERO)
                .build();

        application = loanApplicationRepository.save(application);
        return mapApplicationToDTO(application);
    }

    @Override
    public List<LoanApplicationDTO> getUserLoanApplications(Long userId) {
        return loanApplicationRepository.findByUserId(userId).stream()
                .map(this::mapApplicationToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LoanApplicationDTO getLoanApplicationById(Long applicationId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));
        return mapApplicationToDTO(application);
    }

    // ==================== ADMIN LOAN MANAGEMENT ====================

    @Override
    public List<LoanApplicationDTO> getAllLoanApplications() {
        return loanApplicationRepository.findAll().stream()
                .map(this::mapApplicationToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanApplicationDTO> getPendingLoanApplications() {
        return loanApplicationRepository.findByStatusOrderByAppliedAtDesc(ApplicationStatus.PENDING).stream()
                .map(this::mapApplicationToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanApplicationDTO> getApprovedLoanApplications() {
        return loanApplicationRepository.findByStatusOrderByAppliedAtDesc(ApplicationStatus.APPROVED).stream()
                .map(this::mapApplicationToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanApplicationDTO> getRejectedLoanApplications() {
        return loanApplicationRepository.findByStatusOrderByAppliedAtDesc(ApplicationStatus.REJECTED).stream()
                .map(this::mapApplicationToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LoanApplicationDTO processLoanApplication(Long applicationId, LoanDecisionRequest decision, Long adminId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BadRequestException("This application has already been processed");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        application.setProcessedBy(admin);
        application.setProcessedAt(LocalDateTime.now());

        if ("REJECTED".equalsIgnoreCase(decision.getDecision())) {
            application.setStatus(ApplicationStatus.REJECTED);
            application.setRejectionReason(decision.getRejectionReason());
            application.setAdminRemarks(decision.getRemarks());
        } else if ("APPROVED".equalsIgnoreCase(decision.getDecision())) {
            application.setStatus(ApplicationStatus.APPROVED);
            application.setAdminRemarks(decision.getRemarks());

            // Create loan account and repayment schedule
            createLoanAccount(application);
        } else {
            throw new BadRequestException("Invalid decision. Must be APPROVED or REJECTED");
        }

        application = loanApplicationRepository.save(application);
        return mapApplicationToDTO(application);
    }

    private void createLoanAccount(LoanApplication application) {
        LoanProduct product = application.getLoanProduct();
        BigDecimal principal = application.getRequestedAmount();
        BigDecimal annualRate = product.getInterestRate();
        int tenure = application.getRequestedTenure();

        // Calculate EMI
        BigDecimal emi = EmiCalculatorUtil.calculateEmi(principal, annualRate, tenure);
        BigDecimal totalInterest = EmiCalculatorUtil.calculateTotalInterest(principal, emi, tenure);
        BigDecimal totalAmount = EmiCalculatorUtil.calculateTotalAmount(principal, totalInterest);

        // Generate loan account number
        String loanAccountNumber = "LN" + System.currentTimeMillis();

        LocalDate disbursedDate = LocalDate.now();
        LocalDate firstEmiDate = disbursedDate.plusMonths(1);
        LocalDate lastEmiDate = firstEmiDate.plusMonths(tenure - 1);

        LoanAccount loanAccount = LoanAccount.builder()
                .loanAccountNumber(loanAccountNumber)
                .loanApplication(application)
                .user(application.getUser())
                .loanProduct(product)
                .principalAmount(principal)
                .interestRate(annualRate)
                .tenureMonths(tenure)
                .emiAmount(emi)
                .totalInterest(totalInterest)
                .totalAmount(totalAmount)
                .disbursedAmount(principal)
                .disbursedDate(disbursedDate)
                .firstEmiDate(firstEmiDate)
                .lastEmiDate(lastEmiDate)
                .remainingPrincipal(principal)
                .status(LoanStatus.ACTIVE)
                .build();

        loanAccount = loanAccountRepository.save(loanAccount);

        // Generate repayment schedule
        generateRepaymentSchedule(loanAccount, firstEmiDate);
    }

    private void generateRepaymentSchedule(LoanAccount loanAccount, LocalDate firstEmiDate) {
        BigDecimal principal = loanAccount.getPrincipalAmount();
        BigDecimal annualRate = loanAccount.getInterestRate();
        int tenure = loanAccount.getTenureMonths();
        BigDecimal emi = loanAccount.getEmiAmount();

        EmiCalculatorUtil.AmortizationSchedule[] schedule =
                EmiCalculatorUtil.generateAmortizationSchedule(principal, annualRate, tenure);

        List<LoanRepayment> repayments = new ArrayList<>();
        BigDecimal remainingPrincipal = principal;

        for (int i = 0; i < tenure; i++) {
            EmiCalculatorUtil.AmortizationSchedule entry = schedule[i];
            remainingPrincipal = entry.getRemainingBalance();

            repayments.add(LoanRepayment.builder()
                    .loanAccount(loanAccount)
                    .installmentNumber(i + 1)
                    .dueDate(firstEmiDate.plusMonths(i))
                    .emiAmount(entry.getEmi())
                    .principalComponent(entry.getPrincipalComponent())
                    .interestComponent(entry.getInterestComponent())
                    .remainingPrincipal(remainingPrincipal)
                    .status(RepaymentStatus.PENDING)
                    .paidAmount(BigDecimal.ZERO)
                    .penaltyAmount(BigDecimal.ZERO)
                    .build());
        }

        loanRepaymentRepository.saveAll(repayments);
    }

    // ==================== LOAN ACCOUNTS ====================

    @Override
    public List<LoanAccountDTO> getUserLoanAccounts(Long userId) {
        return loanAccountRepository.findByUserId(userId).stream()
                .map(this::mapLoanAccountToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LoanAccountDTO getLoanAccountById(Long accountId) {
        LoanAccount account = loanAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan account not found"));
        return mapLoanAccountToDTO(account);
    }

    // ==================== REPAYMENTS ====================

    @Override
    public List<LoanRepaymentDTO> getRepaymentsByLoanAccount(Long loanAccountId) {
        return loanRepaymentRepository.findByLoanAccountIdOrderByInstallmentNumberAsc(loanAccountId).stream()
                .map(this::mapRepaymentToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LoanRepaymentDTO> getUserRepayments(Long userId) {
        return loanRepaymentRepository.findByUserIdOrderByDueDate(userId).stream()
                .map(this::mapRepaymentToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LoanRepaymentDTO payRepayment(Long loanAccountId, Long repaymentId) {
        LoanRepayment repayment = loanRepaymentRepository.findById(repaymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Repayment not found"));

        if (!repayment.getLoanAccount().getId().equals(loanAccountId)) {
            throw new BadRequestException("This repayment does not belong to the specified loan account");
        }

        if (repayment.getStatus() == RepaymentStatus.PAID) {
            throw new BadRequestException("This installment has already been paid");
        }

        repayment.setStatus(RepaymentStatus.PAID);
        repayment.setPaidAmount(repayment.getEmiAmount());
        repayment.setPaidDate(LocalDateTime.now());
        repayment.setPaymentReference("LOAN-TXN-" + System.currentTimeMillis());

        // Update remaining principal on loan account
        LoanAccount loanAccount = repayment.getLoanAccount();
        BigDecimal newRemainingPrincipal = loanAccount.getRemainingPrincipal()
                .subtract(repayment.getPrincipalComponent());
        loanAccount.setRemainingPrincipal(newRemainingPrincipal);

        // Check if loan is closed
        if (newRemainingPrincipal.compareTo(BigDecimal.ZERO) <= 0) {
            loanAccount.setStatus(LoanStatus.CLOSED);
        }

        loanRepaymentRepository.save(repayment);
        loanAccountRepository.save(loanAccount);

        return mapRepaymentToDTO(repayment);
    }

    @Override
    @Transactional
    public void checkAndUpdateOverdueRepayments() {
        LocalDate currentDate = LocalDate.now();
        List<LoanRepayment> overdueRepayments = loanRepaymentRepository.findOverdueRepayments(currentDate);

        for (LoanRepayment repayment : overdueRepayments) {
            if (repayment.getStatus() == RepaymentStatus.PENDING) {
                repayment.setStatus(RepaymentStatus.OVERDUE);
                // Add penalty (e.g., 2% of EMI per month overdue)
                BigDecimal penalty = repayment.getEmiAmount()
                        .multiply(BigDecimal.valueOf(0.02))
                        .multiply(BigDecimal.valueOf(
                                java.time.temporal.ChronoUnit.DAYS.between(repayment.getDueDate(), currentDate) / 30.0));
                repayment.setPenaltyAmount(penalty);
                loanRepaymentRepository.save(repayment);
            }
        }
    }

    // ==================== ANALYTICS ====================

    @Override
    public LoanDashboardDTO getAdminDashboardStats() {
        LoanDashboardDTO stats = new LoanDashboardDTO();

        stats.setTotalProducts((long) loanProductRepository.findByIsActiveTrue().size());
        stats.setTotalApplications(loanApplicationRepository.count());
        stats.setPendingApplications(loanApplicationRepository.countByStatus(ApplicationStatus.PENDING));
        stats.setApprovedApplications(loanApplicationRepository.countByStatus(ApplicationStatus.APPROVED));
        stats.setRejectedApplications(loanApplicationRepository.countByStatus(ApplicationStatus.REJECTED));
        stats.setActiveLoans(loanAccountRepository.countByStatus(LoanStatus.ACTIVE));
        stats.setClosedLoans(loanAccountRepository.countByStatus(LoanStatus.CLOSED));

        // Calculate financial metrics
        List<LoanAccount> allAccounts = loanAccountRepository.findAll();
        BigDecimal totalDisbursed = BigDecimal.ZERO;
        BigDecimal totalOutstanding = BigDecimal.ZERO;

        for (LoanAccount account : allAccounts) {
            totalDisbursed = totalDisbursed.add(account.getDisbursedAmount() != null ? account.getDisbursedAmount() : BigDecimal.ZERO);
            totalOutstanding = totalOutstanding.add(account.getRemainingPrincipal() != null ? account.getRemainingPrincipal() : BigDecimal.ZERO);
        }

        stats.setTotalDisbursed(totalDisbursed);
        stats.setTotalOutstanding(totalOutstanding);

        return stats;
    }

    @Override
    public LoanDashboardDTO getUserDashboardStats(Long userId) {
        LoanDashboardDTO stats = new LoanDashboardDTO();

        List<LoanAccount> userAccounts = loanAccountRepository.findByUserId(userId);
        stats.setActiveLoans((long) userAccounts.stream()
                .filter(a -> a.getStatus() == LoanStatus.ACTIVE).count());

        BigDecimal totalOutstanding = BigDecimal.ZERO;
        for (LoanAccount account : userAccounts) {
            if (account.getRemainingPrincipal() != null) {
                totalOutstanding = totalOutstanding.add(account.getRemainingPrincipal());
            }
        }
        stats.setTotalOutstanding(totalOutstanding);

        return stats;
    }

    // ==================== MAPPING HELPERS ====================

    private LoanProductDTO mapProductToDTO(LoanProduct product) {
        return LoanProductDTO.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .loanType(product.getLoanType())
                .description(product.getDescription())
                .minAmount(product.getMinAmount())
                .maxAmount(product.getMaxAmount())
                .interestRate(product.getInterestRate())
                .allowedTenures(product.getAllowedTenures())
                .minTenure(product.getMinTenure())
                .maxTenure(product.getMaxTenure())
                .processingFee(product.getProcessingFee())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private LoanApplicationDTO mapApplicationToDTO(LoanApplication application) {
        LoanApplicationDTO.LoanApplicationDTOBuilder builder = LoanApplicationDTO.builder()
                .id(application.getId())
                .applicationNumber(application.getApplicationNumber())
                .userId(application.getUser().getId())
                .userName(application.getUser().getUsername())
                .userEmail(application.getUser().getEmail())
                .loanProductId(application.getLoanProduct().getId())
                .productName(application.getLoanProduct().getProductName())
                .loanType(application.getLoanProduct().getLoanType().name())
                .requestedAmount(application.getRequestedAmount())
                .requestedTenure(application.getRequestedTenure())
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .processedAt(application.getProcessedAt())
                .adminRemarks(application.getAdminRemarks())
                .rejectionReason(application.getRejectionReason())
                .income(application.getIncome())
                .employerName(application.getEmployerName())
                .designation(application.getDesignation())
                .monthlyIncome(application.getMonthlyIncome())
                .existingEmis(application.getExistingEmis());

        if (application.getProcessedBy() != null) {
            builder.processedBy(application.getProcessedBy().getId())
                    .processedByName(application.getProcessedBy().getUsername());
        }

        return builder.build();
    }

    private LoanAccountDTO mapLoanAccountToDTO(LoanAccount account) {
        LoanAccountDTO.LoanAccountDTOBuilder builder = LoanAccountDTO.builder()
                .id(account.getId())
                .loanAccountNumber(account.getLoanAccountNumber())
                .userId(account.getUser().getId())
                .userName(account.getUser().getUsername())
                .loanProductId(account.getLoanProduct().getId())
                .productName(account.getLoanProduct().getProductName())
                .loanType(account.getLoanProduct().getLoanType().name())
                .principalAmount(account.getPrincipalAmount())
                .interestRate(account.getInterestRate())
                .tenureMonths(account.getTenureMonths())
                .emiAmount(account.getEmiAmount())
                .totalInterest(account.getTotalInterest())
                .totalAmount(account.getTotalAmount())
                .disbursedAmount(account.getDisbursedAmount())
                .disbursedDate(account.getDisbursedDate())
                .firstEmiDate(account.getFirstEmiDate())
                .lastEmiDate(account.getLastEmiDate())
                .remainingPrincipal(account.getRemainingPrincipal())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt());

        if (account.getLoanApplication() != null) {
            builder.loanApplicationId(account.getLoanApplication().getId());
        }

        // Calculate additional stats
        long totalInstallments = account.getTenureMonths();
        long paidInstallments = loanRepaymentRepository.countPaidByLoanAccountId(account.getId());
        builder.totalInstallments((int) totalInstallments)
                .paidInstallments((int) paidInstallments)
                .remainingInstallments((int) (totalInstallments - paidInstallments));

        return builder.build();
    }

    private LoanRepaymentDTO mapRepaymentToDTO(LoanRepayment repayment) {
        boolean isOverdue = repayment.getStatus() == RepaymentStatus.PENDING &&
                repayment.getDueDate().isBefore(LocalDate.now());

        return LoanRepaymentDTO.builder()
                .id(repayment.getId())
                .loanAccountId(repayment.getLoanAccount().getId())
                .loanAccountNumber(repayment.getLoanAccount().getLoanAccountNumber())
                .installmentNumber(repayment.getInstallmentNumber())
                .dueDate(repayment.getDueDate())
                .emiAmount(repayment.getEmiAmount())
                .principalComponent(repayment.getPrincipalComponent())
                .interestComponent(repayment.getInterestComponent())
                .remainingPrincipal(repayment.getRemainingPrincipal())
                .status(repayment.getStatus())
                .paidAmount(repayment.getPaidAmount())
                .paidDate(repayment.getPaidDate())
                .paymentReference(repayment.getPaymentReference())
                .penaltyAmount(repayment.getPenaltyAmount())
                .isOverdue(isOverdue)
                .build();
    }

    private List<Integer> parseTenures(String allowedTenures) {
        return Arrays.stream(allowedTenures.split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
    }

    private String generateApplicationNumber() {
        return "LA" + System.currentTimeMillis();
    }
}
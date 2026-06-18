package com.neobank.service.impl;

import com.neobank.dto.LoanApplicationDTO;
import com.neobank.dto.LoanApplicationRequest;
import com.neobank.dto.LoanDecisionRequest;
import com.neobank.dto.LoanProductRequest;
import com.neobank.dto.LoanRepaymentDTO;
import com.neobank.entity.Account;
import com.neobank.entity.AccountType;
import com.neobank.entity.LoanAccount;
import com.neobank.entity.LoanApplication;
import com.neobank.entity.LoanProduct;
import com.neobank.entity.LoanRepayment;
import com.neobank.entity.Transaction;
import com.neobank.entity.User;
import com.neobank.entity.UserRole;
import com.neobank.exception.BadRequestException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.LoanAccountRepository;
import com.neobank.repository.LoanApplicationRepository;
import com.neobank.repository.LoanProductRepository;
import com.neobank.repository.LoanRepaymentRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import com.neobank.service.NotificationService;
import com.neobank.util.PaymentCategoryUtil;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoanServiceImplTest {

    @Test
    void createLoanProductRejectsTenureOutsideConfiguredRange() {
        LoanServiceImpl service = service(mock(LoanProductRepository.class), mock(LoanApplicationRepository.class),
                mock(LoanAccountRepository.class), mock(LoanRepaymentRepository.class), mock(UserRepository.class),
                mock(AccountRepository.class), mock(TransactionRepository.class), mock(NotificationService.class));

        assertThrows(BadRequestException.class, () -> service.createLoanProduct(LoanProductRequest.builder()
                .productName("Personal")
                .loanType(LoanProduct.LoanType.PERSONAL)
                .minAmount(new BigDecimal("50000"))
                .maxAmount(new BigDecimal("500000"))
                .interestRate(new BigDecimal("0.115"))
                .allowedTenures("6,12,60")
                .minTenure(12)
                .maxTenure(48)
                .build(), 1L));
    }

    @Test
    void applyForLoanRejectsDuplicatePendingApplication() {
        UserRepository userRepository = mock(UserRepository.class);
        LoanProductRepository loanProductRepository = mock(LoanProductRepository.class);
        LoanApplicationRepository applicationRepository = mock(LoanApplicationRepository.class);
        User user = User.builder().id(1L).username("user").email("user@test.com").role(UserRole.USER).build();
        LoanProduct product = loanProduct();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(loanProductRepository.findById(10L)).thenReturn(Optional.of(product));
        when(applicationRepository.findPendingApplicationByUserId(1L))
                .thenReturn(List.of(LoanApplication.builder().id(99L).build()));
        LoanServiceImpl service = service(loanProductRepository, applicationRepository, mock(LoanAccountRepository.class),
                mock(LoanRepaymentRepository.class), userRepository, mock(AccountRepository.class),
                mock(TransactionRepository.class), mock(NotificationService.class));

        assertThrows(BadRequestException.class, () -> service.applyForLoan(LoanApplicationRequest.builder()
                .loanProductId(10L)
                .requestedAmount(new BigDecimal("100000"))
                .requestedTenure(12)
                .build(), 1L));
    }

    @Test
    void applyForLoanCreatesPendingApplicationWhenValid() {
        UserRepository userRepository = mock(UserRepository.class);
        LoanProductRepository loanProductRepository = mock(LoanProductRepository.class);
        LoanApplicationRepository applicationRepository = mock(LoanApplicationRepository.class);
        User user = User.builder().id(1L).username("user").email("user@test.com").role(UserRole.USER).build();
        LoanProduct product = loanProduct();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(loanProductRepository.findById(10L)).thenReturn(Optional.of(product));
        when(applicationRepository.findPendingApplicationByUserId(1L)).thenReturn(List.of());
        when(applicationRepository.save(any(LoanApplication.class))).thenAnswer(invocation -> {
            LoanApplication application = invocation.getArgument(0);
            application.setId(50L);
            return application;
        });
        LoanServiceImpl service = service(loanProductRepository, applicationRepository, mock(LoanAccountRepository.class),
                mock(LoanRepaymentRepository.class), userRepository, mock(AccountRepository.class),
                mock(TransactionRepository.class), mock(NotificationService.class));

        LoanApplicationDTO dto = service.applyForLoan(LoanApplicationRequest.builder()
                .loanProductId(10L)
                .requestedAmount(new BigDecimal("100000"))
                .requestedTenure(12)
                .income(new BigDecimal("800000"))
                .build(), 1L);

        assertEquals(50L, dto.getId());
        assertEquals(LoanApplication.ApplicationStatus.PENDING, dto.getStatus());
        assertTrue(dto.getApplicationNumber().startsWith("LA"));
    }

    @Test
    void approvingLoanCreatesLoanAccountAndFullRepaymentSchedule() {
        UserRepository userRepository = mock(UserRepository.class);
        LoanApplicationRepository applicationRepository = mock(LoanApplicationRepository.class);
        LoanAccountRepository accountRepository = mock(LoanAccountRepository.class);
        LoanRepaymentRepository repaymentRepository = mock(LoanRepaymentRepository.class);
        User customer = User.builder().id(1L).username("user").email("user@test.com").role(UserRole.USER).build();
        User admin = User.builder().id(2L).username("admin").email("admin@test.com").role(UserRole.ADMIN).build();
        LoanApplication application = LoanApplication.builder()
                .id(30L)
                .applicationNumber("LA30")
                .user(customer)
                .loanProduct(loanProduct())
                .requestedAmount(new BigDecimal("100000"))
                .requestedTenure(12)
                .status(LoanApplication.ApplicationStatus.PENDING)
                .build();
        when(applicationRepository.findById(30L)).thenReturn(Optional.of(application));
        when(userRepository.findById(2L)).thenReturn(Optional.of(admin));
        when(accountRepository.save(any(LoanAccount.class))).thenAnswer(invocation -> {
            LoanAccount loanAccount = invocation.getArgument(0);
            loanAccount.setId(70L);
            return loanAccount;
        });
        when(applicationRepository.save(application)).thenReturn(application);
        LoanServiceImpl service = service(mock(LoanProductRepository.class), applicationRepository, accountRepository,
                repaymentRepository, userRepository, mock(AccountRepository.class), mock(TransactionRepository.class),
                mock(NotificationService.class));

        LoanApplicationDTO dto = service.processLoanApplication(30L, LoanDecisionRequest.builder()
                .decision("APPROVED")
                .remarks("Approved")
                .build(), 2L);

        assertEquals(LoanApplication.ApplicationStatus.APPROVED, dto.getStatus());
        ArgumentCaptor<List<LoanRepayment>> captor = ArgumentCaptor.forClass(List.class);
        verify(repaymentRepository).saveAll(captor.capture());
        assertEquals(12, captor.getValue().size());
        assertEquals(LoanRepayment.RepaymentStatus.PENDING, captor.getValue().get(0).getStatus());
    }

    @Test
    void payRepaymentDebitsBankAccountAndMarksInstallmentPaid() {
        UserRepository userRepository = mock(UserRepository.class);
        AccountRepository bankAccountRepository = mock(AccountRepository.class);
        LoanRepaymentRepository repaymentRepository = mock(LoanRepaymentRepository.class);
        LoanAccountRepository loanAccountRepository = mock(LoanAccountRepository.class);
        TransactionRepository transactionRepository = mock(TransactionRepository.class);
        NotificationService notificationService = mock(NotificationService.class);
        User customer = User.builder().id(1L).username("user").email("user@test.com").role(UserRole.USER).build();
        LoanAccount loanAccount = LoanAccount.builder()
                .id(90L)
                .loanAccountNumber("LN90")
                .user(customer)
                .loanProduct(loanProduct())
                .remainingPrincipal(new BigDecimal("100000"))
                .status(LoanAccount.LoanStatus.ACTIVE)
                .build();
        LoanRepayment repayment = LoanRepayment.builder()
                .id(91L)
                .loanAccount(loanAccount)
                .installmentNumber(1)
                .dueDate(LocalDate.now().plusMonths(1))
                .emiAmount(new BigDecimal("9000"))
                .principalComponent(new BigDecimal("8000"))
                .interestComponent(new BigDecimal("1000"))
                .remainingPrincipal(new BigDecimal("92000"))
                .status(LoanRepayment.RepaymentStatus.PENDING)
                .penaltyAmount(BigDecimal.ZERO)
                .build();
        Account bankAccount = Account.builder()
                .id(10L)
                .user(customer)
                .accountNumber("NB10")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("15000"))
                .build();
        when(repaymentRepository.findById(91L)).thenReturn(Optional.of(repayment));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(bankAccountRepository.findByUser(customer)).thenReturn(List.of(bankAccount));
        LoanServiceImpl service = service(mock(LoanProductRepository.class), mock(LoanApplicationRepository.class),
                loanAccountRepository, repaymentRepository, userRepository, bankAccountRepository,
                transactionRepository, notificationService);

        LoanRepaymentDTO dto = service.payRepayment(90L, 91L, 1L);

        assertEquals(LoanRepayment.RepaymentStatus.PAID, dto.getStatus());
        assertEquals(new BigDecimal("6000"), bankAccount.getBalance());
        assertEquals(new BigDecimal("92000"), loanAccount.getRemainingPrincipal());
        verify(transactionRepository).save(org.mockito.ArgumentMatchers.argThat(transaction ->
                PaymentCategoryUtil.EMI_PAYMENT.equals(transaction.getCategory())));
        verify(notificationService).createNotification(any(Long.class), any(String.class), any(String.class));
    }

    private LoanProduct loanProduct() {
        return LoanProduct.builder()
                .id(10L)
                .productName("Personal Flexi")
                .loanType(LoanProduct.LoanType.PERSONAL)
                .minAmount(new BigDecimal("50000"))
                .maxAmount(new BigDecimal("500000"))
                .interestRate(new BigDecimal("0.115"))
                .allowedTenures("12,24,36")
                .minTenure(12)
                .maxTenure(36)
                .processingFee(BigDecimal.ZERO)
                .isActive(true)
                .build();
    }

    private LoanServiceImpl service(LoanProductRepository productRepository,
            LoanApplicationRepository applicationRepository,
            LoanAccountRepository accountRepository,
            LoanRepaymentRepository repaymentRepository,
            UserRepository userRepository,
            AccountRepository bankAccountRepository,
            TransactionRepository transactionRepository,
            NotificationService notificationService) {
        return new LoanServiceImpl(productRepository, applicationRepository, accountRepository, repaymentRepository,
                userRepository, bankAccountRepository, transactionRepository, notificationService);
    }
}

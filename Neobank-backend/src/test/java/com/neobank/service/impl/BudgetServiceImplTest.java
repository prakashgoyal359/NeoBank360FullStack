package com.neobank.service.impl;

import com.neobank.dto.BudgetDTO;
import com.neobank.dto.BudgetRequest;
import com.neobank.entity.Account;
import com.neobank.entity.Budget;
import com.neobank.entity.Transaction;
import com.neobank.entity.TransactionType;
import com.neobank.entity.User;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.BudgetRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BudgetServiceImplTest {

    @Test
    void createOrUpdateBudgetCreatesBudgetWhenMissing() {
        UserRepository userRepository = mock(UserRepository.class);
        BudgetRepository budgetRepository = mock(BudgetRepository.class);
        AccountRepository accountRepository = mock(AccountRepository.class);
        TransactionRepository transactionRepository = mock(TransactionRepository.class);
        User user = User.builder().id(1L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(budgetRepository.findByUserAndCategoryAndBudgetMonth(user, "Travel Payment", YearMonth.parse("2026-06")))
                .thenReturn(Optional.empty());
        when(accountRepository.findByUser(user)).thenReturn(List.of());
        BudgetServiceImpl service = new BudgetServiceImpl(userRepository, budgetRepository, transactionRepository,
                accountRepository);

        BudgetDTO dto = service.createOrUpdateBudget(1L, BudgetRequest.builder()
                .category("Travel Payment")
                .limitAmount(new BigDecimal("5000"))
                .budgetMonth("2026-06")
                .build());

        assertEquals("Travel Payment", dto.getCategory());
        assertEquals(new BigDecimal("5000"), dto.getLimitAmount());
        verify(budgetRepository).save(any(Budget.class));
    }

    @Test
    void getBudgetWithSpendingAggregatesMatchingCategoryAndMonth() {
        UserRepository userRepository = mock(UserRepository.class);
        BudgetRepository budgetRepository = mock(BudgetRepository.class);
        AccountRepository accountRepository = mock(AccountRepository.class);
        TransactionRepository transactionRepository = mock(TransactionRepository.class);
        User user = User.builder().id(1L).build();
        Account account = Account.builder().id(10L).user(user).build();
        Budget budget = Budget.builder()
                .id(2L)
                .user(user)
                .category("Bill Payment")
                .limitAmount(new BigDecimal("1000"))
                .budgetMonth(YearMonth.parse("2026-06"))
                .build();
        Transaction matching = Transaction.builder()
                .account(account)
                .transactionType(TransactionType.DEBIT)
                .amount(new BigDecimal("250"))
                .category("Bill Payment")
                .transactionDate(LocalDateTime.of(2026, 6, 5, 10, 0))
                .build();
        Transaction outsideMonth = Transaction.builder()
                .account(account)
                .transactionType(TransactionType.DEBIT)
                .amount(new BigDecimal("500"))
                .category("Bill Payment")
                .transactionDate(LocalDateTime.of(2026, 7, 1, 10, 0))
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(budgetRepository.findByUserAndBudgetMonth(user, YearMonth.parse("2026-06"))).thenReturn(List.of(budget));
        when(accountRepository.findByUser(user)).thenReturn(List.of(account));
        when(transactionRepository.findByAccountOrderByTransactionDateDesc(any(Account.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(matching, outsideMonth)));
        BudgetServiceImpl service = new BudgetServiceImpl(userRepository, budgetRepository, transactionRepository,
                accountRepository);

        BudgetDTO dto = service.getBudgetWithSpending(1L, "2026-06");

        assertEquals(new BigDecimal("1000"), dto.getTotalBudget());
        assertEquals(new BigDecimal("250"), dto.getTotalSpent());
        assertEquals(new BigDecimal("750"), dto.getRemaining());
        assertEquals(25.0, dto.getUtilizationPercentage());
    }

    @Test
    void getBudgetsForUserRejectsMissingUser() {
        BudgetServiceImpl service = new BudgetServiceImpl(mock(UserRepository.class), mock(BudgetRepository.class),
                mock(TransactionRepository.class), mock(AccountRepository.class));

        assertThrows(ResourceNotFoundException.class, () -> service.getBudgetsForUser(99L));
    }
}

package com.neobank.service.impl;

import com.neobank.dto.BudgetDTO;
import com.neobank.dto.BudgetRequest;
import com.neobank.entity.Budget;
import com.neobank.entity.User;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.AccountRepository;
import com.neobank.repository.BudgetRepository;
import com.neobank.repository.TransactionRepository;
import com.neobank.repository.UserRepository;
import com.neobank.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public BudgetDTO createOrUpdateBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        YearMonth month = YearMonth.parse(request.getBudgetMonth());
        Budget budget = budgetRepository.findByUserAndCategoryAndBudgetMonth(user, request.getCategory(), month)
                .orElseGet(() -> Budget.builder()
                        .user(user)
                        .category(request.getCategory())
                        .budgetMonth(month)
                        .build());

        budget.setLimitAmount(request.getLimitAmount());
        budgetRepository.save(budget);
        return mapBudget(budget);
    }

    @Override
    public List<BudgetDTO> getBudgetsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return budgetRepository.findByUser(user).stream()
                .map(this::mapBudget)
                .collect(Collectors.toList());
    }

    @Override
    public BudgetDTO getBudgetById(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        return mapBudget(budget);
    }

    @Override
    public BudgetDTO getBudgetWithSpending(Long userId, String month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        YearMonth yearMonth = YearMonth.parse(month);
        List<Budget> budgets = budgetRepository.findByUserAndBudgetMonth(user, yearMonth);

        BigDecimal totalBudget = budgets.stream()
                .map(Budget::getLimitAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = BigDecimal.ZERO;
        for (Budget budget : budgets) {
            BigDecimal spent = calculateSpendingForCategory(user, budget.getCategory(), yearMonth);
            totalSpent = totalSpent.add(spent);
        }

        BigDecimal remaining = totalBudget.subtract(totalSpent);
        double utilization = totalBudget.doubleValue() > 0
                ? totalSpent.doubleValue() / totalBudget.doubleValue() * 100
                : 0;

        return BudgetDTO.builder()
                .totalBudget(totalBudget)
                .totalSpent(totalSpent)
                .remaining(remaining.max(BigDecimal.ZERO))
                .utilizationPercentage(Math.min(100.0, utilization))
                .budgetMonth(month)
                .budgets(budgets.stream().map(this::mapBudget).collect(Collectors.toList()))
                .build();
    }

    private BigDecimal calculateSpendingForCategory(User user, String category, YearMonth month) {
        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.plusMonths(1).atDay(1).atStartOfDay();
        return accountRepository.findByUser(user).stream()
                .flatMap(account -> transactionRepository
                        .findByAccountOrderByTransactionDateDesc(account, Pageable.unpaged()).stream())
                .filter(transaction -> category.equalsIgnoreCase(transaction.getCategory()))
                .filter(transaction -> !transaction.getTransactionDate().isBefore(start)
                        && transaction.getTransactionDate().isBefore(end))
                .map(transaction -> transaction.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional
    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        if (!budget.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        budgetRepository.delete(budget);
    }

    private BudgetDTO mapBudget(Budget budget) {
        YearMonth month = budget.getBudgetMonth();
        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.plusMonths(1).atDay(1).atStartOfDay();
        BigDecimal spent = accountRepository.findByUser(budget.getUser()).stream()
                .flatMap(account -> transactionRepository
                        .findByAccountOrderByTransactionDateDesc(account, Pageable.unpaged()).stream())
                .filter(transaction -> budget.getCategory().equalsIgnoreCase(transaction.getCategory()))
                .filter(transaction -> !transaction.getTransactionDate().isBefore(start)
                        && transaction.getTransactionDate().isBefore(end))
                .map(transaction -> transaction.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = budget.getLimitAmount().subtract(spent);
        double utilization = budget.getLimitAmount().doubleValue() > 0
                ? spent.doubleValue() / budget.getLimitAmount().doubleValue() * 100
                : 0;

        return BudgetDTO.builder()
                .id(budget.getId())
                .category(budget.getCategory())
                .limitAmount(budget.getLimitAmount())
                .spent(spent)
                .remaining(remaining.max(BigDecimal.ZERO))
                .utilizationPercentage(Math.min(100.0, utilization))
                .budgetMonth(budget.getBudgetMonth().toString())
                .build();
    }
}

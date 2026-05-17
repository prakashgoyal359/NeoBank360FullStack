package com.neobank.service;

import com.neobank.dto.BudgetDTO;
import com.neobank.dto.BudgetRequest;

import java.util.List;

public interface BudgetService {
    BudgetDTO createOrUpdateBudget(Long userId, BudgetRequest request);

    List<BudgetDTO> getBudgetsForUser(Long userId);

    BudgetDTO getBudgetById(Long budgetId, Long userId);

    BudgetDTO getBudgetWithSpending(Long userId, String month);

    void deleteBudget(Long budgetId, Long userId);
}

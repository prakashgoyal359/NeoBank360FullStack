package com.neobank.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetDTO {
    private Long id;
    private String category;
    private BigDecimal limitAmount;
    private BigDecimal spent;
    private BigDecimal remaining;
    private Double utilizationPercentage;
    private String budgetMonth;

    // Analytics fields
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private List<BudgetDTO> budgets;
}

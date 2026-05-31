package com.neobank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrendEntryDTO {
    private String monthLabel;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
}

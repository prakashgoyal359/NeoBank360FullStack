package com.neobank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdvancedAnalyticsDTO {
    private BigDecimal currentNetWorth;
    private BigDecimal accountBalance;
    private BigDecimal outstandingLoans;
    private Long rewardBalance;
    private List<AnalyticsPointDTO> spendingBreakdown;
    private List<AnalyticsPointDTO> budgetVsActual;
    private List<AnalyticsPointDTO> netWorthProgression;
    private List<AnalyticsPointDTO> rewardGrowth;
    private List<AnalyticsPointDTO> loanPayoffForecast;
}

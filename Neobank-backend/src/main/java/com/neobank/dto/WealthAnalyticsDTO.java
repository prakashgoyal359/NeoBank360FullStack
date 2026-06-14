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
public class WealthAnalyticsDTO {
    private BigDecimal accountBalance;
    private BigDecimal outstandingLoanPrincipal;
    private BigDecimal netWorth;
    private List<AnalyticsPointDTO> netWorthProgression;
    private List<AnalyticsPointDTO> rewardGrowth;
}

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
public class AdminAdvancedAnalyticsDTO {
    private String period;
    private Long transactionVolume;
    private BigDecimal transactionAmount;
    private BigDecimal creditAmount;
    private BigDecimal debitAmount;
    private BigDecimal totalDisbursed;
    private BigDecimal outstandingPrincipal;
    private Long pendingLoans;
    private Long approvedLoans;
    private Long rejectedLoans;
    private Long auditEvents;
    private List<TrendEntryDTO> transactionTrend;
    private List<AnalyticsPointDTO> transactionCategoryBreakdown;
    private List<AnalyticsPointDTO> loanStatusDistribution;
}

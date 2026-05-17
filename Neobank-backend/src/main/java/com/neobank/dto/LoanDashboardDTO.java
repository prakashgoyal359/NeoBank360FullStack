package com.neobank.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDashboardDTO {
    private Long totalProducts;
    private Long totalApplications;
    private Long pendingApplications;
    private Long approvedApplications;
    private Long rejectedApplications;
    private Long activeLoans;
    private Long closedLoans;
    private BigDecimal totalDisbursed;
    private BigDecimal totalOutstanding;
    private BigDecimal totalEmiReceivable;
    private BigDecimal totalEmiPaid;
    private Long overdueRepayments;
    private BigDecimal overdueAmount;
}
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
public class AdminDashboardDTO {
    private long totalUsers;
    private long totalActiveUsers;
    private long totalLoans;
    private long pendingApprovals;
    private long totalTransactions;
    private BigDecimal platformSavingsRate;
}

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
public class TransactionAnalyticsDTO {
    private String period;
    private List<TrendEntryDTO> dailyVolumes;
    private BigDecimal averageTicketSize;
    private BigDecimal totalInflow;
    private BigDecimal totalOutflow;
    private Long totalTransactions;
}

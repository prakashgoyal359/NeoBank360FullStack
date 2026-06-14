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
public class LoanAnalyticsDTO {
    private Long pending;
    private Long approved;
    private Long rejected;
    private BigDecimal npaRatio;
    private List<AnalyticsPointDTO> loanDistribution;
}

package com.neobank.dto;

import com.neobank.entity.LoanProduct.LoanType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanProductDTO {
    private Long id;
    private String productName;
    private LoanType loanType;
    private String description;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private BigDecimal interestRate;
    private String allowedTenures;
    private Integer minTenure;
    private Integer maxTenure;
    private BigDecimal processingFee;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
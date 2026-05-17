package com.neobank.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplicationRequest {

    @NotNull(message = "Loan product ID is required")
    private Long loanProductId;

    @NotNull(message = "Requested amount is required")
    @Positive(message = "Requested amount must be positive")
    private BigDecimal requestedAmount;

    @NotNull(message = "Tenure is required")
    @Positive(message = "Tenure must be positive")
    private Integer requestedTenure;

    private BigDecimal income;
    private String employerName;
    private String designation;
    private BigDecimal monthlyIncome;
    private BigDecimal existingEmis;
}
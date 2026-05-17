package com.neobank.dto;

import com.neobank.entity.LoanProduct.LoanType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name must not exceed 100 characters")
    private String productName;

    @NotNull(message = "Loan type is required")
    private LoanType loanType;

    private String description;

    @NotNull(message = "Minimum amount is required")
    @Positive(message = "Minimum amount must be positive")
    private BigDecimal minAmount;

    @NotNull(message = "Maximum amount is required")
    @Positive(message = "Maximum amount must be positive")
    private BigDecimal maxAmount;

    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.0", message = "Interest rate must be non-negative")
    @DecimalMax(value = "1.0", message = "Interest rate must not exceed 100%")
    private BigDecimal interestRate;

    @NotBlank(message = "Allowed tenures is required")
    private String allowedTenures;

    @NotNull(message = "Minimum tenure is required")
    @Positive(message = "Minimum tenure must be positive")
    private Integer minTenure;

    @NotNull(message = "Maximum tenure is required")
    @Positive(message = "Maximum tenure must be positive")
    private Integer maxTenure;

    @DecimalMin(value = "0.0", message = "Processing fee must be non-negative")
    @DecimalMax(value = "1.0", message = "Processing fee must not exceed 100%")
    private BigDecimal processingFee;
}
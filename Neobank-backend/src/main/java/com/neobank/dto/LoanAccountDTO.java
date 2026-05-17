package com.neobank.dto;

import com.neobank.entity.LoanAccount.LoanStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanAccountDTO {
    private Long id;
    private String loanAccountNumber;
    private Long loanApplicationId;
    private Long userId;
    private String userName;
    private Long loanProductId;
    private String productName;
    private String loanType;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private BigDecimal emiAmount;
    private BigDecimal totalInterest;
    private BigDecimal totalAmount;
    private BigDecimal disbursedAmount;
    private LocalDate disbursedDate;
    private LocalDate firstEmiDate;
    private LocalDate lastEmiDate;
    private BigDecimal remainingPrincipal;
    private LoanStatus status;
    private LocalDateTime createdAt;
    private Integer totalInstallments;
    private Integer paidInstallments;
    private Integer remainingInstallments;
    private BigDecimal totalPaid;
    private BigDecimal totalRemaining;
}
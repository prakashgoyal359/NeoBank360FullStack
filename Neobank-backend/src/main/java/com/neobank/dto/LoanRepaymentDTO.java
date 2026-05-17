package com.neobank.dto;

import com.neobank.entity.LoanRepayment.RepaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanRepaymentDTO {
    private Long id;
    private Long loanAccountId;
    private String loanAccountNumber;
    private Integer installmentNumber;
    private LocalDate dueDate;
    private BigDecimal emiAmount;
    private BigDecimal principalComponent;
    private BigDecimal interestComponent;
    private BigDecimal remainingPrincipal;
    private RepaymentStatus status;
    private BigDecimal paidAmount;
    private LocalDateTime paidDate;
    private String paymentReference;
    private BigDecimal penaltyAmount;
    private Boolean isOverdue;
}
package com.neobank.dto;

import com.neobank.entity.LoanApplication.ApplicationStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanApplicationDTO {
    private Long id;
    private String applicationNumber;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long loanProductId;
    private String productName;
    private String loanType;
    private BigDecimal requestedAmount;
    private Integer requestedTenure;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime processedAt;
    private Long processedBy;
    private String processedByName;
    private String adminRemarks;
    private String rejectionReason;
    private BigDecimal income;
    private String employerName;
    private String designation;
    private BigDecimal monthlyIncome;
    private BigDecimal existingEmis;
}
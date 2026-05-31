package com.neobank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingApprovalDTO {
    private Long id;
    private String module;
    private String applicantName;
    private String productName;
    private BigDecimal requestedAmount;
    private LocalDateTime applicationDate;
    private String status;
}

package com.neobank.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDecisionRequest {
    private String decision; // "APPROVED" or "REJECTED"
    private String remarks;
    private String rejectionReason;
}
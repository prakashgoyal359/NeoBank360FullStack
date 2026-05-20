package com.neobank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDecisionRequest {

    @NotBlank(message = "Decision is required")
    @Pattern(regexp = "APPROVED|REJECTED|approved|rejected", message = "Decision must be APPROVED or REJECTED")
    private String decision; // "APPROVED" or "REJECTED"

    private String remarks;
    private String rejectionReason;
}

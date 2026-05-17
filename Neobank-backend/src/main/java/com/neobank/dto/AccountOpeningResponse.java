package com.neobank.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountOpeningResponse {
    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String aadhaarNumber;
    private String panNumber;
    private String address;
    private String accountType;
    private String gender;
    private String status;
    private LocalDateTime submittedAt;
    private String message;
    private String aadhaarCardPath;
    private String panCardPath;
    private String photoPath;
    private String dateOfBirth;
    private String occupation;
    private BigDecimal annualIncome;
    private BigDecimal initialDeposit;
}

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
public class UserActivityDTO {
    private Long transactionId;
    private String accountNumber;
    private String transactionType;
    private BigDecimal amount;
    private String category;
    private String description;
    private LocalDateTime transactionDate;
}

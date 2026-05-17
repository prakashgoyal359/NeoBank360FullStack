package com.neobank.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private Long id;
    private String transactionType;
    private BigDecimal amount;
    private String description;
    private String category;
    private BigDecimal balanceAfter;
    private LocalDateTime transactionDate;
}

package com.neobank.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillDTO {
    private Long id;
    private String billerName;
    private String billerAccountNumber;
    private String billType;
    private String category;
    private BigDecimal amount;
    private String dueDate;
    private String status;
    private String description;
    private Boolean remindMe;
    private String createdAt;
    private String paidAt;
}

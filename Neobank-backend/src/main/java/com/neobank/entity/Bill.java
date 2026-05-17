package com.neobank.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "account_id", nullable = true)
    private Account account;

    @Column(nullable = false, length = 100)
    private String billerName;

    @Column(name = "biller_account_number", length = 50, nullable = true)
    private String billerAccountNumber;

    @Column(name = "bill_type", length = 50, nullable = true)
    private String billType;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private java.time.LocalDate dueDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BillStatus status = BillStatus.PENDING;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime paidAt;
}

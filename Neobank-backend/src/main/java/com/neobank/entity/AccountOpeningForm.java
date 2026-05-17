package com.neobank.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_opening_forms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountOpeningForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String mobileNumber;

    @Column(nullable = false, unique = true)
    private String aadhaarNumber;

    @Column(nullable = false)
    private String panNumber;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    @Column(length = 50)
    private String gender;

    @Column
    private String aadhaarCardPath;

    @Column
    private String panCardPath;

    @Column
    private String photoPath;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column
    private LocalDateTime approvedAt;

    @Column(length = 500)
    private String rejectionReason;

    private String dateOfBirth;
    private String occupation;
    private BigDecimal annualIncome;
    private BigDecimal initialDeposit;
}

package com.neobank.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255)
    private String endpoint;

    @Column(length = 20)
    private String httpMethod;

    private Integer responseStatus;

    private Long executionTimeMs;

    private Long actingUserId;

    @Column(length = 100)
    private String actingUsername;

    @Column(length = 100)
    private String eventType;

    private LocalDateTime eventTimestamp;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
}

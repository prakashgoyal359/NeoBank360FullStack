package com.neobank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemAuditLogDTO {
    private Long id;
    private String endpoint;
    private String httpMethod;
    private Integer responseStatus;
    private Long executionTimeMs;
    private Long actingUserId;
    private String actingUsername;
    private String eventType;
    private LocalDateTime eventTimestamp;
    private String errorMessage;
}

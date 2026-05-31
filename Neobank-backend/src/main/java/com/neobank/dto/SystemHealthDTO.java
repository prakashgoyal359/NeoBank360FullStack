package com.neobank.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemHealthDTO {
    private String databaseStatus;
    private long activeSessionCount;
    private String serverUptime;
    private String applicationHealth;
}

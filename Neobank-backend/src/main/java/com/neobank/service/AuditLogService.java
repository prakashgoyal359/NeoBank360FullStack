package com.neobank.service;

public interface AuditLogService {
    void log(Long actingAdminId, String action, String targetResourceType, String targetResourceId);
}

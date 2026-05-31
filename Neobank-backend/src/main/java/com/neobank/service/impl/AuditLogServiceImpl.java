package com.neobank.service.impl;

import com.neobank.service.AuditLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {
    @Override
    public void log(Long actingAdminId, String action, String targetResourceType, String targetResourceId) {
        log.info("AUDIT actingAdminId={} action={} targetResourceType={} targetResourceId={} timestamp={}",
                actingAdminId, action, targetResourceType, targetResourceId, LocalDateTime.now());
    }
}

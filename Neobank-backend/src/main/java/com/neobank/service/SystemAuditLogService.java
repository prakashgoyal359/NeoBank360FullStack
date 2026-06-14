package com.neobank.service;

import com.neobank.dto.SystemAuditLogDTO;
import com.neobank.entity.SystemAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface SystemAuditLogService {
    void save(SystemAuditLog auditLog);

    Page<SystemAuditLogDTO> search(String search, String endpoint, String username, LocalDateTime from,
            LocalDateTime to, Pageable pageable);
}

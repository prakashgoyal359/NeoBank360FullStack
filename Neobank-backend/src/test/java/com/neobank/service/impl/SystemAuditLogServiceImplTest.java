package com.neobank.service.impl;

import com.neobank.dto.SystemAuditLogDTO;
import com.neobank.entity.SystemAuditLog;
import com.neobank.repository.SystemAuditLogRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SystemAuditLogServiceImplTest {

    @Test
    void savePersistsAuditLog() {
        SystemAuditLogRepository repository = mock(SystemAuditLogRepository.class);
        SystemAuditLogServiceImpl service = new SystemAuditLogServiceImpl(repository);
        SystemAuditLog log = SystemAuditLog.builder()
                .endpoint("/api/admin/dashboard")
                .eventType("ADMIN_ACTION")
                .build();

        service.save(log);

        verify(repository).save(log);
    }

    @Test
    void searchMapsAuditLogToDtoPage() {
        SystemAuditLogRepository repository = mock(SystemAuditLogRepository.class);
        SystemAuditLogServiceImpl service = new SystemAuditLogServiceImpl(repository);
        PageRequest pageable = PageRequest.of(0, 10);
        LocalDateTime timestamp = LocalDateTime.of(2026, 6, 13, 10, 30);
        SystemAuditLog log = SystemAuditLog.builder()
                .id(7L)
                .endpoint("/api/admin/dashboard")
                .httpMethod("GET")
                .responseStatus(200)
                .executionTimeMs(42L)
                .actingUserId(1L)
                .actingUsername("admin")
                .eventType("ADMIN_ACTION")
                .eventTimestamp(timestamp)
                .build();
        when(repository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(log), pageable, 1));

        Page<SystemAuditLogDTO> result = service.search("admin", "/api/admin", "admin", null, null, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("/api/admin/dashboard", result.getContent().get(0).getEndpoint());
        assertEquals("ADMIN_ACTION", result.getContent().get(0).getEventType());
        assertEquals(timestamp, result.getContent().get(0).getEventTimestamp());
    }
}

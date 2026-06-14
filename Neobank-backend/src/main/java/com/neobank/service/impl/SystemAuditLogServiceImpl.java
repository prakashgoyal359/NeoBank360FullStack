package com.neobank.service.impl;

import com.neobank.dto.SystemAuditLogDTO;
import com.neobank.entity.SystemAuditLog;
import com.neobank.repository.SystemAuditLogRepository;
import com.neobank.service.SystemAuditLogService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemAuditLogServiceImpl implements SystemAuditLogService {

    private final SystemAuditLogRepository repository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void save(SystemAuditLog auditLog) {
        repository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SystemAuditLogDTO> search(String search, String endpoint, String username, LocalDateTime from,
            LocalDateTime to, Pageable pageable) {
        Specification<SystemAuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("endpoint")), term),
                        cb.like(cb.lower(root.get("eventType")), term),
                        cb.like(cb.lower(root.get("actingUsername")), term)));
            }
            if (endpoint != null && !endpoint.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("endpoint")), "%" + endpoint.trim().toLowerCase() + "%"));
            }
            if (username != null && !username.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("actingUsername")), "%" + username.trim().toLowerCase() + "%"));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("eventTimestamp"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("eventTimestamp"), to));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return repository.findAll(spec, pageable).map(this::map);
    }

    private SystemAuditLogDTO map(SystemAuditLog log) {
        return SystemAuditLogDTO.builder()
                .id(log.getId())
                .endpoint(log.getEndpoint())
                .httpMethod(log.getHttpMethod())
                .responseStatus(log.getResponseStatus())
                .executionTimeMs(log.getExecutionTimeMs())
                .actingUserId(log.getActingUserId())
                .actingUsername(log.getActingUsername())
                .eventType(log.getEventType())
                .eventTimestamp(log.getEventTimestamp())
                .errorMessage(log.getErrorMessage())
                .build();
    }
}

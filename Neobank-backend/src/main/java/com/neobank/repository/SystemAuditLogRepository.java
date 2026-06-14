package com.neobank.repository;

import com.neobank.entity.SystemAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemAuditLogRepository extends JpaRepository<SystemAuditLog, Long>,
        JpaSpecificationExecutor<SystemAuditLog> {
    Page<SystemAuditLog> findByOrderByEventTimestampDesc(Pageable pageable);
}

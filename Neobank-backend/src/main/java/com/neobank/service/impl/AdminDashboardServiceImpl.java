package com.neobank.service.impl;

import com.neobank.dto.AdminDashboardDTO;
import com.neobank.dto.PendingApprovalDTO;
import com.neobank.dto.SystemHealthDTO;
import com.neobank.dto.UserActivityDTO;
import com.neobank.repository.AdminDashboardRepository;
import com.neobank.service.AdminDashboardService;
import com.neobank.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final AdminDashboardRepository adminDashboardRepository;
    private final JdbcTemplate jdbcTemplate;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardDTO getDashboard(Long adminId) {
        BigDecimal income = safe(adminDashboardRepository.totalPlatformIncome());
        BigDecimal expense = safe(adminDashboardRepository.totalPlatformExpense());
        BigDecimal savingsRate = income.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : income.subtract(expense).multiply(BigDecimal.valueOf(100)).divide(income, 2, RoundingMode.HALF_UP);

        auditLogService.log(adminId, "VIEW_ADMIN_DASHBOARD", "ADMIN_DASHBOARD", "dashboard");

        return AdminDashboardDTO.builder()
                .totalUsers(adminDashboardRepository.count())
                .totalActiveUsers(adminDashboardRepository.countByIsActiveTrue())
                .totalLoans(adminDashboardRepository.countLoans())
                .pendingApprovals(adminDashboardRepository.countPendingLoanApprovals())
                .totalTransactions(adminDashboardRepository.countTransactions())
                .platformSavingsRate(savingsRate)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PendingApprovalDTO> getPendingApprovals(String module, Long adminId) {
        auditLogService.log(adminId, "VIEW_PENDING_APPROVALS", "PENDING_APPROVALS", module == null ? "ALL" : module);
        return adminDashboardRepository.findPendingApprovals(module == null ? "" : module.toUpperCase()).stream()
                .map(row -> PendingApprovalDTO.builder()
                        .id(row.getId())
                        .module(row.getModule())
                        .applicantName(row.getApplicantName())
                        .productName(row.getProductName())
                        .requestedAmount(row.getRequestedAmount())
                        .applicationDate(row.getApplicationDate())
                        .status(row.getStatus())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SystemHealthDTO getSystemHealth(Long adminId) {
        String dbStatus;
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbStatus = result != null && result == 1 ? "UP" : "DOWN";
        } catch (Exception ex) {
            dbStatus = "DOWN";
        }
        Duration uptime = Duration.ofMillis(ManagementFactory.getRuntimeMXBean().getUptime());
        String formattedUptime = "%dd %dh %dm".formatted(uptime.toDays(), uptime.toHoursPart(), uptime.toMinutesPart());
        auditLogService.log(adminId, "VIEW_SYSTEM_HEALTH", "SYSTEM_HEALTH", "live");

        return SystemHealthDTO.builder()
                .databaseStatus(dbStatus)
                .activeSessionCount(adminDashboardRepository.countByIsActiveTrue())
                .serverUptime(formattedUptime)
                .applicationHealth("UP".equals(dbStatus) ? "UP" : "DEGRADED")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserActivityDTO> getUserActivity(Long userId, Pageable pageable, Long adminId) {
        auditLogService.log(adminId, "VIEW_USER_ACTIVITY", "USER", String.valueOf(userId));
        return adminDashboardRepository.findUserActivity(userId, pageable)
                .map(row -> UserActivityDTO.builder()
                        .transactionId(row.getTransactionId())
                        .accountNumber(row.getAccountNumber())
                        .transactionType(row.getTransactionType())
                        .amount(row.getAmount())
                        .category(row.getCategory())
                        .description(row.getDescription())
                        .transactionDate(row.getTransactionDate())
                        .build());
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}

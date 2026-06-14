package com.neobank.service.impl;

import com.neobank.dto.AdminAdvancedAnalyticsDTO;
import com.neobank.dto.AdminDashboardDTO;
import com.neobank.dto.AnalyticsPointDTO;
import com.neobank.dto.PendingApprovalDTO;
import com.neobank.dto.SystemHealthDTO;
import com.neobank.dto.TrendEntryDTO;
import com.neobank.dto.TransactionAnalyticsDTO;
import com.neobank.dto.LoanAnalyticsDTO;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public AdminAdvancedAnalyticsDTO getAdvancedAnalytics(String period, Long adminId) {
        String normalizedPeriod = normalizePeriod(period);
        LocalDateTime startDate = resolveStartDate(normalizedPeriod);
        BigDecimal credit = safe(adminDashboardRepository.totalCreditSince(startDate));
        BigDecimal debit = safe(adminDashboardRepository.totalDebitSince(startDate));

        auditLogService.log(adminId, "VIEW_ADVANCED_ADMIN_ANALYTICS", "ADMIN_ANALYTICS", normalizedPeriod);

        return AdminAdvancedAnalyticsDTO.builder()
                .period(normalizedPeriod)
                .transactionVolume(adminDashboardRepository.countTransactionsSince(startDate))
                .transactionAmount(credit.add(debit))
                .creditAmount(credit)
                .debitAmount(debit)
                .totalDisbursed(safe(adminDashboardRepository.totalDisbursed()))
                .outstandingPrincipal(safe(adminDashboardRepository.totalOutstandingPrincipal()))
                .pendingLoans(adminDashboardRepository.countPendingLoanApprovals())
                .approvedLoans(adminDashboardRepository.countApprovedLoanApprovals())
                .rejectedLoans(adminDashboardRepository.countRejectedLoanApprovals())
                .auditEvents(adminDashboardRepository.countDerivedAuditEventsSince(startDate))
                .transactionTrend(adminDashboardRepository.findTransactionTrendSince(startDate).stream()
                        .map(row -> TrendEntryDTO.builder()
                                .monthLabel(row.getMonthKey())
                                .totalIncome(safe(row.getTotalIncome()))
                                .totalExpense(safe(row.getTotalExpense()))
                                .build())
                        .toList())
                .transactionCategoryBreakdown(adminDashboardRepository.findTransactionCategoryBreakdownSince(startDate).stream()
                        .map(this::mapPoint)
                        .toList())
                .loanStatusDistribution(adminDashboardRepository.findLoanStatusDistribution().stream()
                        .map(this::mapPoint)
                        .toList())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionAnalyticsDTO getTransactionAnalytics(String period, Long adminId) {
        String normalizedPeriod = normalizePeriod(period);
        LocalDateTime startDate = resolveStartDate(normalizedPeriod);
        BigDecimal inflow = safe(adminDashboardRepository.totalCreditSince(startDate));
        BigDecimal outflow = safe(adminDashboardRepository.totalDebitSince(startDate));
        long count = adminDashboardRepository.countTransactionsSince(startDate);
        BigDecimal averageTicketSize = count == 0
                ? BigDecimal.ZERO
                : inflow.add(outflow).divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        auditLogService.log(adminId, "VIEW_TRANSACTION_ANALYTICS", "ADMIN_ANALYTICS", normalizedPeriod);

        return TransactionAnalyticsDTO.builder()
                .period(normalizedPeriod)
                .dailyVolumes(adminDashboardRepository.findTransactionTrendSince(startDate).stream()
                        .map(row -> TrendEntryDTO.builder()
                                .monthLabel(row.getMonthKey())
                                .totalIncome(safe(row.getTotalIncome()))
                                .totalExpense(safe(row.getTotalExpense()))
                                .build())
                        .toList())
                .averageTicketSize(averageTicketSize)
                .totalInflow(inflow)
                .totalOutflow(outflow)
                .totalTransactions(count)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public LoanAnalyticsDTO getLoanAnalytics(Long adminId) {
        long activeOrTotalLoans = adminDashboardRepository.countLoans();
        long overdueLoans = adminDashboardRepository.findLoanAccountStatusDistribution().stream()
                .filter(row -> "DEFAULTED".equalsIgnoreCase(row.getLabel()) || "NPA".equalsIgnoreCase(row.getLabel()))
                .map(row -> safe(row.getValue()).longValue())
                .reduce(0L, Long::sum);
        BigDecimal npaRatio = activeOrTotalLoans == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(overdueLoans).multiply(BigDecimal.valueOf(100))
                        .divide(BigDecimal.valueOf(activeOrTotalLoans), 2, RoundingMode.HALF_UP);

        auditLogService.log(adminId, "VIEW_LOAN_ANALYTICS", "ADMIN_ANALYTICS", "LOANS");

        return LoanAnalyticsDTO.builder()
                .pending(adminDashboardRepository.countPendingLoanApprovals())
                .approved(adminDashboardRepository.countApprovedLoanApprovals())
                .rejected(adminDashboardRepository.countRejectedLoanApprovals())
                .npaRatio(npaRatio)
                .loanDistribution(adminDashboardRepository.findLoanAccountStatusDistribution().stream()
                        .map(this::mapPoint)
                        .toList())
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

    private AnalyticsPointDTO mapPoint(AdminDashboardRepository.AnalyticsPointProjection row) {
        return AnalyticsPointDTO.builder()
                .label(row.getLabel())
                .value(safe(row.getValue()))
                .secondaryValue(safe(row.getSecondaryValue()))
                .build();
    }

    private String normalizePeriod(String period) {
        if (period == null || period.isBlank()) {
            return "30D";
        }
        String normalized = period.trim().toUpperCase();
        return switch (normalized) {
            case "7D", "30D", "YTD" -> normalized;
            default -> "30D";
        };
    }

    private LocalDateTime resolveStartDate(String period) {
        LocalDate today = LocalDate.now();
        return switch (period) {
            case "7D" -> today.minusDays(6).atStartOfDay();
            case "YTD" -> today.withDayOfYear(1).atStartOfDay();
            default -> today.minusDays(29).atStartOfDay();
        };
    }
}

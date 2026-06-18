package com.neobank.service.impl;

import com.neobank.dto.AdminDashboardDTO;
import com.neobank.repository.AdminDashboardRepository;
import com.neobank.service.AuditLogService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminDashboardServiceImplTest {

    @Test
    void getDashboardCalculatesPlatformSavingsRateFromLiveTotals() {
        AdminDashboardRepository repository = mock(AdminDashboardRepository.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        when(repository.totalPlatformIncome()).thenReturn(new BigDecimal("10000"));
        when(repository.totalPlatformExpense()).thenReturn(new BigDecimal("6500"));
        when(repository.count()).thenReturn(4L);
        when(repository.countByIsActiveTrue()).thenReturn(3L);
        when(repository.countLoans()).thenReturn(2L);
        when(repository.countPendingLoanApprovals()).thenReturn(1L);
        when(repository.countTransactions()).thenReturn(20L);
        AdminDashboardServiceImpl service = new AdminDashboardServiceImpl(repository, mock(JdbcTemplate.class),
                auditLogService);

        AdminDashboardDTO dto = service.getDashboard(1L);

        assertEquals(new BigDecimal("35.00"), dto.getPlatformSavingsRate());
        assertEquals(4L, dto.getTotalUsers());
        assertEquals(3L, dto.getTotalActiveUsers());
        assertEquals(2L, dto.getTotalLoans());
        assertEquals(1L, dto.getPendingApprovals());
        assertEquals(20L, dto.getTotalTransactions());
        verify(auditLogService).log(1L, "VIEW_ADMIN_DASHBOARD", "ADMIN_DASHBOARD", "dashboard");
    }

    @Test
    void getDashboardReturnsZeroSavingsRateWhenIncomeIsZero() {
        AdminDashboardRepository repository = mock(AdminDashboardRepository.class);
        when(repository.totalPlatformIncome()).thenReturn(BigDecimal.ZERO);
        when(repository.totalPlatformExpense()).thenReturn(new BigDecimal("1000"));
        AdminDashboardServiceImpl service = new AdminDashboardServiceImpl(repository, mock(JdbcTemplate.class),
                mock(AuditLogService.class));

        AdminDashboardDTO dto = service.getDashboard(1L);

        assertEquals(BigDecimal.ZERO, dto.getPlatformSavingsRate());
    }

    @Test
    void getDashboardTreatsNullIncomeAndExpenseAsZero() {
        AdminDashboardRepository repository = mock(AdminDashboardRepository.class);
        AuditLogService auditLogService = mock(AuditLogService.class);
        when(repository.totalPlatformIncome()).thenReturn(null);
        when(repository.totalPlatformExpense()).thenReturn(null);
        AdminDashboardServiceImpl service = new AdminDashboardServiceImpl(repository, mock(JdbcTemplate.class),
                auditLogService);

        AdminDashboardDTO dto = service.getDashboard(2L);

        assertEquals(BigDecimal.ZERO, dto.getPlatformSavingsRate());
        verify(auditLogService).log(2L, "VIEW_ADMIN_DASHBOARD", "ADMIN_DASHBOARD", "dashboard");
    }
}

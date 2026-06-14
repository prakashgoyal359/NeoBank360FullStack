package com.neobank.service;

import com.neobank.dto.AdminDashboardDTO;
import com.neobank.dto.AdminAdvancedAnalyticsDTO;
import com.neobank.dto.PendingApprovalDTO;
import com.neobank.dto.SystemHealthDTO;
import com.neobank.dto.TransactionAnalyticsDTO;
import com.neobank.dto.LoanAnalyticsDTO;
import com.neobank.dto.UserActivityDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminDashboardService {
    AdminDashboardDTO getDashboard(Long adminId);
    AdminAdvancedAnalyticsDTO getAdvancedAnalytics(String period, Long adminId);
    TransactionAnalyticsDTO getTransactionAnalytics(String period, Long adminId);
    LoanAnalyticsDTO getLoanAnalytics(Long adminId);
    List<PendingApprovalDTO> getPendingApprovals(String module, Long adminId);
    SystemHealthDTO getSystemHealth(Long adminId);
    Page<UserActivityDTO> getUserActivity(Long userId, Pageable pageable, Long adminId);
}

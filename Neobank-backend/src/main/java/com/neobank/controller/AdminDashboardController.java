package com.neobank.controller;

import com.neobank.dto.AdminDashboardDTO;
import com.neobank.dto.PendingApprovalDTO;
import com.neobank.dto.SystemHealthDTO;
import com.neobank.dto.UserActivityDTO;
import com.neobank.security.SecurityUtils;
import com.neobank.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;
    private final SecurityUtils securityUtils;

    @GetMapping("/dashboard")
    @Operation(summary = "Admin analytics dashboard", description = "ADMIN only KPI analytics generated from live database values")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminDashboardService.getDashboard(securityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/pending-approvals")
    @Operation(summary = "Pending approvals", description = "ADMIN only oldest-first pending approvals with module filtering")
    public ResponseEntity<List<PendingApprovalDTO>> getPendingApprovals(@RequestParam(required = false) String module) {
        return ResponseEntity.ok(adminDashboardService.getPendingApprovals(module, securityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/system-health")
    @Operation(summary = "System health", description = "ADMIN only live DB and application health")
    public ResponseEntity<SystemHealthDTO> getSystemHealth() {
        return ResponseEntity.ok(adminDashboardService.getSystemHealth(securityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/users/{userId}/activity")
    @Operation(summary = "User activity", description = "ADMIN only paginated user transaction activity")
    public ResponseEntity<Page<UserActivityDTO>> getUserActivity(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminDashboardService.getUserActivity(userId, PageRequest.of(page, size),
                securityUtils.getCurrentUser().getId()));
    }
}

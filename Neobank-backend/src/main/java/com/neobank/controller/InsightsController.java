package com.neobank.controller;

import com.neobank.dto.FinancialInsightsDTO;
import com.neobank.security.SecurityUtils;
import com.neobank.service.InsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class InsightsController {

    private final InsightsService insightsService;
    private final SecurityUtils securityUtils;

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get financial insights", description = "Owner-only read-only income, expense, savings, and six-month trends")
    public ResponseEntity<FinancialInsightsDTO> getInsights(@PathVariable Long userId) {
        Long requesterId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(insightsService.getFinancialInsights(userId, requesterId));
    }
}

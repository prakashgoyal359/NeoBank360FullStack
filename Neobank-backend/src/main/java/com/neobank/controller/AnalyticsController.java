package com.neobank.controller;

import com.neobank.dto.LoanPayoffForecastDTO;
import com.neobank.dto.SpendingAnalyticsDTO;
import com.neobank.dto.WealthAnalyticsDTO;
import com.neobank.security.SecurityUtils;
import com.neobank.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AnalyticsController {

    private final InsightsService insightsService;
    private final SecurityUtils securityUtils;

    @GetMapping("/spending/{userId}")
    public ResponseEntity<SpendingAnalyticsDTO> getSpendingAnalytics(@PathVariable Long userId) {
        return ResponseEntity.ok(insightsService.getSpendingAnalytics(userId, securityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/wealth/{userId}")
    public ResponseEntity<WealthAnalyticsDTO> getWealthAnalytics(@PathVariable Long userId) {
        return ResponseEntity.ok(insightsService.getWealthAnalytics(userId, securityUtils.getCurrentUser().getId()));
    }

    @GetMapping("/loan-payoff/{userId}")
    public ResponseEntity<LoanPayoffForecastDTO> getLoanPayoffForecast(@PathVariable Long userId) {
        return ResponseEntity.ok(insightsService.getLoanPayoffForecast(userId, securityUtils.getCurrentUser().getId()));
    }
}

package com.neobank.service;

import com.neobank.dto.FinancialInsightsDTO;
import com.neobank.dto.LoanPayoffForecastDTO;
import com.neobank.dto.SpendingAnalyticsDTO;
import com.neobank.dto.UserAdvancedAnalyticsDTO;
import com.neobank.dto.WealthAnalyticsDTO;

public interface InsightsService {
    FinancialInsightsDTO getFinancialInsights(Long userId, Long requesterId);
    UserAdvancedAnalyticsDTO getAdvancedInsights(Long userId, Long requesterId);
    SpendingAnalyticsDTO getSpendingAnalytics(Long userId, Long requesterId);
    WealthAnalyticsDTO getWealthAnalytics(Long userId, Long requesterId);
    LoanPayoffForecastDTO getLoanPayoffForecast(Long userId, Long requesterId);
}

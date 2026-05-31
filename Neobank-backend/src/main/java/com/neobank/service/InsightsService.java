package com.neobank.service;

import com.neobank.dto.FinancialInsightsDTO;

public interface InsightsService {
    FinancialInsightsDTO getFinancialInsights(Long userId, Long requesterId);
}

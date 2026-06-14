package com.neobank.service.impl;

import com.neobank.repository.InsightsRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class InsightsServiceImplTest {

    @Test
    void getAdvancedInsightsRejectsCrossUserAccess() {
        InsightsServiceImpl service = new InsightsServiceImpl(mock(InsightsRepository.class));

        assertThrows(AccessDeniedException.class, () -> service.getAdvancedInsights(10L, 20L));
    }

    @Test
    void getSpendingAnalyticsRejectsCrossUserAccess() {
        InsightsServiceImpl service = new InsightsServiceImpl(mock(InsightsRepository.class));

        assertThrows(AccessDeniedException.class, () -> service.getSpendingAnalytics(10L, 20L));
    }
}

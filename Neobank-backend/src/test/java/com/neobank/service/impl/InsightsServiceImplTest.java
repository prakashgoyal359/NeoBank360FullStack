package com.neobank.service.impl;

import com.neobank.dto.FinancialInsightsDTO;
import com.neobank.entity.TransactionType;
import com.neobank.repository.InsightsRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class InsightsServiceImplTest {

    @Test
    void getFinancialInsightsCalculatesIncomeExpenseSavingsAndSixMonthTrend() {
        InsightsRepository repository = mock(InsightsRepository.class);
        YearMonth currentMonth = YearMonth.now();
        String currentMonthKey = currentMonth.toString();
        String currentMonthLabel = currentMonth.format(DateTimeFormatter.ofPattern("MMM yyyy"));
        when(repository.sumByUserAndType(10L, TransactionType.CREDIT)).thenReturn(new BigDecimal("10000"));
        when(repository.sumByUserAndType(10L, TransactionType.DEBIT)).thenReturn(new BigDecimal("12500"));
        when(repository.findSixMonthTrend(org.mockito.ArgumentMatchers.eq(10L), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(new MonthlyTrend(currentMonthKey, new BigDecimal("5000"), new BigDecimal("3000"))));
        InsightsServiceImpl service = new InsightsServiceImpl(repository);

        FinancialInsightsDTO dto = service.getFinancialInsights(10L, 10L);

        assertEquals(new BigDecimal("10000"), dto.getTotalIncome());
        assertEquals(new BigDecimal("12500"), dto.getTotalExpense());
        assertEquals(new BigDecimal("-2500"), dto.getSavings());
        assertEquals(6, dto.getTrendSummary().size());
        assertEquals(new BigDecimal("5000"), dto.getTrendSummary().stream()
                .filter(entry -> currentMonthLabel.equals(entry.getMonthLabel()))
                .findFirst()
                .orElseThrow()
                .getTotalIncome());
    }

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

    private record MonthlyTrend(String monthKey, BigDecimal totalIncome, BigDecimal totalExpense)
            implements InsightsRepository.MonthlyTrendProjection {
        @Override
        public String getMonthKey() {
            return monthKey;
        }

        @Override
        public BigDecimal getTotalIncome() {
            return totalIncome;
        }

        @Override
        public BigDecimal getTotalExpense() {
            return totalExpense;
        }
    }
}

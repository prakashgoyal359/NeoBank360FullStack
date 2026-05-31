package com.neobank.service.impl;

import com.neobank.dto.FinancialInsightsDTO;
import com.neobank.dto.TrendEntryDTO;
import com.neobank.entity.TransactionType;
import com.neobank.repository.InsightsRepository;
import com.neobank.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InsightsServiceImpl implements InsightsService {

    private final InsightsRepository insightsRepository;

    @Override
    @Transactional(readOnly = true)
    public FinancialInsightsDTO getFinancialInsights(Long userId, Long requesterId) {
        if (!userId.equals(requesterId)) {
            throw new AccessDeniedException("Cross-user insights access is forbidden");
        }

        BigDecimal income = safe(insightsRepository.sumByUserAndType(userId, TransactionType.CREDIT));
        BigDecimal expense = safe(insightsRepository.sumByUserAndType(userId, TransactionType.DEBIT));

        YearMonth firstMonth = YearMonth.now().minusMonths(5);
        Map<String, TrendEntryDTO> trend = new LinkedHashMap<>();
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 0; i < 6; i++) {
            YearMonth month = firstMonth.plusMonths(i);
            trend.put(month.toString(), TrendEntryDTO.builder()
                    .monthLabel(month.format(labelFormatter))
                    .totalIncome(BigDecimal.ZERO)
                    .totalExpense(BigDecimal.ZERO)
                    .build());
        }

        insightsRepository.findSixMonthTrend(userId, firstMonth.atDay(1).atStartOfDay())
                .forEach(row -> {
                    TrendEntryDTO entry = trend.get(row.getMonthKey());
                    if (entry != null) {
                        entry.setTotalIncome(safe(row.getTotalIncome()));
                        entry.setTotalExpense(safe(row.getTotalExpense()));
                    }
                });

        return FinancialInsightsDTO.builder()
                .totalIncome(income)
                .totalExpense(expense)
                .savings(income.subtract(expense))
                .trendSummary(List.copyOf(trend.values()))
                .build();
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}

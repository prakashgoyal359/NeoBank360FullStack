package com.neobank.controller;

import com.neobank.dto.FinancialInsightsDTO;
import com.neobank.dto.UserAdvancedAnalyticsDTO;
import com.neobank.entity.User;
import com.neobank.repository.UserRepository;
import com.neobank.security.SecurityUtils;
import com.neobank.service.InsightsService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class InsightsControllerTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getInsightsUsesRequesterIdFromSecurityUtils() {
        InsightsService insightsService = mock(InsightsService.class);
        UserRepository userRepository = mock(UserRepository.class);
        SecurityUtils securityUtils = new SecurityUtils(userRepository);
        InsightsController controller = new InsightsController(insightsService, securityUtils);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user@test.com", null));
        when(userRepository.findByUsername("user@test.com")).thenReturn(Optional.of(User.builder().id(7L).build()));
        when(insightsService.getFinancialInsights(7L, 7L)).thenReturn(FinancialInsightsDTO.builder()
                .totalIncome(new BigDecimal("1000"))
                .totalExpense(new BigDecimal("400"))
                .savings(new BigDecimal("600"))
                .build());

        ResponseEntity<FinancialInsightsDTO> response = controller.getInsights(7L);

        assertEquals(new BigDecimal("600"), response.getBody().getSavings());
        verify(insightsService).getFinancialInsights(7L, 7L);
    }

    @Test
    void getAdvancedInsightsUsesRequesterIdFromSecurityUtils() {
        InsightsService insightsService = mock(InsightsService.class);
        UserRepository userRepository = mock(UserRepository.class);
        SecurityUtils securityUtils = new SecurityUtils(userRepository);
        InsightsController controller = new InsightsController(insightsService, securityUtils);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user@test.com", null));
        when(userRepository.findByUsername("user@test.com")).thenReturn(Optional.of(User.builder().id(7L).build()));
        when(insightsService.getAdvancedInsights(7L, 7L)).thenReturn(UserAdvancedAnalyticsDTO.builder()
                .currentNetWorth(new BigDecimal("5000"))
                .build());

        ResponseEntity<UserAdvancedAnalyticsDTO> response = controller.getAdvancedInsights(7L);

        assertEquals(new BigDecimal("5000"), response.getBody().getCurrentNetWorth());
        verify(insightsService).getAdvancedInsights(7L, 7L);
    }
}

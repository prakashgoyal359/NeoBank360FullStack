package com.neobank.controller;

import com.neobank.dto.LoanApplicationDTO;
import com.neobank.dto.LoanApplicationRequest;
import com.neobank.dto.LoanProductDTO;
import com.neobank.dto.LoanProductRequest;
import com.neobank.entity.LoanApplication;
import com.neobank.entity.LoanProduct;
import com.neobank.entity.User;
import com.neobank.repository.UserRepository;
import com.neobank.security.SecurityUtils;
import com.neobank.service.LoanService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoanControllerTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createLoanProductUsesCurrentAdminId() {
        LoanService loanService = mock(LoanService.class);
        UserRepository userRepository = mock(UserRepository.class);
        SecurityUtils securityUtils = new SecurityUtils(userRepository);
        LoanController controller = new LoanController(loanService, securityUtils);
        User admin = User.builder().id(9L).username("admin").build();
        LoanProductRequest request = productRequest();
        LoanProductDTO dto = LoanProductDTO.builder().id(1L).productName("Personal Flexi").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", null));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(admin));
        when(loanService.createLoanProduct(request, 9L)).thenReturn(dto);

        ResponseEntity<LoanProductDTO> response = controller.createLoanProduct(request);

        assertEquals(1L, response.getBody().getId());
        verify(loanService).createLoanProduct(request, 9L);
    }

    @Test
    void applyForLoanUsesCurrentUserId() {
        LoanService loanService = mock(LoanService.class);
        UserRepository userRepository = mock(UserRepository.class);
        SecurityUtils securityUtils = new SecurityUtils(userRepository);
        LoanController controller = new LoanController(loanService, securityUtils);
        User user = User.builder().id(5L).username("user").build();
        LoanApplicationRequest request = LoanApplicationRequest.builder()
                .loanProductId(1L)
                .requestedAmount(new BigDecimal("100000"))
                .requestedTenure(12)
                .build();
        LoanApplicationDTO dto = LoanApplicationDTO.builder()
                .id(20L)
                .status(LoanApplication.ApplicationStatus.PENDING)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("user", null));
        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(loanService.applyForLoan(request, 5L)).thenReturn(dto);

        ResponseEntity<LoanApplicationDTO> response = controller.applyForLoan(request);

        assertEquals(20L, response.getBody().getId());
        verify(loanService).applyForLoan(request, 5L);
    }

    @Test
    void getAllLoanProductsReturnsServiceList() {
        LoanService loanService = mock(LoanService.class);
        LoanController controller = new LoanController(loanService, new SecurityUtils(mock(UserRepository.class)));
        when(loanService.getAllLoanProducts()).thenReturn(List.of(LoanProductDTO.builder().id(1L).build()));

        ResponseEntity<List<LoanProductDTO>> response = controller.getAllLoanProducts();

        assertEquals(1, response.getBody().size());
    }

    private LoanProductRequest productRequest() {
        return LoanProductRequest.builder()
                .productName("Personal Flexi")
                .loanType(LoanProduct.LoanType.PERSONAL)
                .minAmount(new BigDecimal("50000"))
                .maxAmount(new BigDecimal("500000"))
                .interestRate(new BigDecimal("0.115"))
                .allowedTenures("12,24,36")
                .minTenure(12)
                .maxTenure(36)
                .build();
    }
}

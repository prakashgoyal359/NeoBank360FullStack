package com.neobank.controller;

import com.neobank.dto.LoginRequest;
import com.neobank.dto.LoginResponse;
import com.neobank.dto.RegisterRequest;
import com.neobank.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthControllerTest {

    @Test
    void loginDelegatesToAuthService() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService);
        LoginRequest request = LoginRequest.builder().username("user@test.com").password("secret").build();
        LoginResponse loginResponse = LoginResponse.builder()
                .token("jwt")
                .username("user@test.com")
                .role("USER")
                .build();
        when(authService.authenticate(request)).thenReturn(loginResponse);

        ResponseEntity<LoginResponse> response = controller.login(request);

        assertEquals("jwt", response.getBody().getToken());
        verify(authService).authenticate(request);
    }

    @Test
    void registerDelegatesToAuthService() {
        AuthService authService = mock(AuthService.class);
        AuthController controller = new AuthController(authService);
        RegisterRequest request = RegisterRequest.builder()
                .email("new@test.com")
                .password("secret")
                .fullName("New User")
                .mobileNumber("9999999999")
                .build();

        ResponseEntity<String> response = controller.register(request);

        assertEquals("Registration successful. Please login after approval.", response.getBody());
        verify(authService).registerUser(request);
    }
}

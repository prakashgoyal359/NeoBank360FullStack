package com.neobank.service.impl;

import com.neobank.dto.LoginRequest;
import com.neobank.dto.LoginResponse;
import com.neobank.dto.RegisterRequest;
import com.neobank.entity.User;
import com.neobank.entity.UserRole;
import com.neobank.exception.BadRequestException;
import com.neobank.repository.UserRepository;
import com.neobank.security.CustomUserDetailsService;
import com.neobank.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {

    @Test
    void authenticateReturnsJwtAndUserDetails() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        JwtService jwtService = mock(JwtService.class);
        CustomUserDetailsService userDetailsService = mock(CustomUserDetailsService.class);
        AuthServiceImpl service = new AuthServiceImpl(userRepository, passwordEncoder, authenticationManager,
                jwtService, userDetailsService);
        User user = User.builder()
                .id(5L)
                .username("user@test.com")
                .email("user@test.com")
                .fullName("Test User")
                .role(UserRole.USER)
                .build();
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("user@test.com");
        when(userDetailsService.loadUserByUsername("user@test.com")).thenReturn(userDetails);
        when(userRepository.findByUsername("user@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("user@test.com", "USER", 5L)).thenReturn("jwt-token");

        LoginResponse response = service.authenticate(LoginRequest.builder()
                .username("user@test.com")
                .password("secret")
                .build());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        assertEquals("jwt-token", response.getToken());
        assertEquals(5L, response.getUserId());
        assertEquals("USER", response.getRole());
    }

    @Test
    void authenticateConvertsBadCredentialsToBadRequest() {
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));
        AuthServiceImpl service = new AuthServiceImpl(mock(UserRepository.class), mock(PasswordEncoder.class),
                authenticationManager, mock(JwtService.class), mock(CustomUserDetailsService.class));

        assertThrows(BadRequestException.class, () -> service.authenticate(LoginRequest.builder()
                .username("bad@test.com")
                .password("wrong")
                .build()));
    }

    @Test
    void registerUserEncodesPasswordAndSavesUser() {
        UserRepository userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(userRepository.findByUsername("new@test.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encoded");
        AuthServiceImpl service = new AuthServiceImpl(userRepository, passwordEncoder,
                mock(AuthenticationManager.class), mock(JwtService.class), mock(CustomUserDetailsService.class));

        service.registerUser(RegisterRequest.builder()
                .email("new@test.com")
                .password("password")
                .fullName("New User")
                .mobileNumber("9999999999")
                .gender("Male")
                .build());

        verify(passwordEncoder).encode("password");
        verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(user ->
                user.getUsername().equals("new@test.com")
                        && user.getRole() == UserRole.USER
                        && user.getIsActive()
                        && user.getIsApproved()
                        && user.getPasswordHash().equals("encoded")));
    }

    @Test
    void registerUserRejectsDuplicateEmail() {
        UserRepository userRepository = mock(UserRepository.class);
        when(userRepository.findByUsername("existing@test.com")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("existing@test.com")).thenReturn(Optional.of(User.builder().build()));
        AuthServiceImpl service = new AuthServiceImpl(userRepository, mock(PasswordEncoder.class),
                mock(AuthenticationManager.class), mock(JwtService.class), mock(CustomUserDetailsService.class));

        assertThrows(BadRequestException.class, () -> service.registerUser(RegisterRequest.builder()
                .email("existing@test.com")
                .password("password")
                .fullName("Existing User")
                .mobileNumber("9999999999")
                .build()));

        verify(userRepository, org.mockito.Mockito.never()).save(any(User.class));
    }
}

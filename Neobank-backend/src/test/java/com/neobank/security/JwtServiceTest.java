package com.neobank.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret",
                "neobank360secretkeyneobank360secretkeyneobank360secretkeyneobank360secretkey");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 86400000);
    }

    @Test
    void generateTokenStoresUsernameRoleAndUserIdClaims() {
        String token = jwtService.generateToken("user@test.com", "USER", 42L);

        assertEquals("user@test.com", jwtService.getUsernameFromToken(token));
        assertEquals("USER", jwtService.getRoleFromToken(token));
        assertEquals(42L, jwtService.getUserIdFromToken(token));
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    void isTokenValidChecksUserDetailsUsername() {
        String token = jwtService.generateToken("user@test.com", "USER", 42L);
        UserDetails matching = new User("user@test.com", "password", Collections.emptyList());
        UserDetails different = new User("other@test.com", "password", Collections.emptyList());

        assertTrue(jwtService.isTokenValid(token, matching));
        assertFalse(jwtService.isTokenValid(token, different));
    }

    @Test
    void invalidTokenReturnsFalse() {
        assertFalse(jwtService.isTokenValid("not-a-jwt"));
    }
}

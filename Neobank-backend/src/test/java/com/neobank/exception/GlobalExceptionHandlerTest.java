package com.neobank.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private final HttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");

    @Test
    void resourceNotFoundReturns404ApiError() {
        ResponseEntity<ApiError> response =
                handler.handleResourceNotFound(new ResourceNotFoundException("Missing"), request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Missing", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
    }

    @Test
    void badRequestReturns400ApiError() {
        ResponseEntity<ApiError> response = handler.handleBadRequest(new BadRequestException("Invalid"), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid", response.getBody().getMessage());
    }

    @Test
    void accessDeniedReturns403ApiError() {
        ResponseEntity<ApiError> response =
                handler.handleAccessDenied(new AccessDeniedException("Forbidden"), request);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Forbidden", response.getBody().getMessage());
    }

    @Test
    void dataIntegrityViolationUsesFriendlyAadhaarMessage() {
        DataIntegrityViolationException exception =
                new DataIntegrityViolationException("constraint", new RuntimeException("aadhaar unique key"));

        ResponseEntity<ApiError> response = handler.handleDataIntegrityViolation(exception, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("An application already exists for this Aadhaar number", response.getBody().getMessage());
    }
}

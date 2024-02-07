package com.example.usermanagementservice.controller;

import com.example.usermanagementservice.service.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {
    @Mock
    private AuthenticationService authenticationService;

    private AuthenticationController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new AuthenticationController(authenticationService);
    }

    @Test
    void testValidateSession_ValidToken() {
        // Arrange
        String validToken = "validToken";
        when(authenticationService.isValidSessionToken(validToken)).thenReturn(true);

        // Act
        ResponseEntity<?> responseEntity = controller.validateSession(validToken);

        // Assert
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals("Session token is valid", responseEntity.getBody());
    }

    @Test
    void testValidateSession_InvalidToken() {
        // Arrange
        String invalidToken = "invalidToken";
        when(authenticationService.isValidSessionToken(invalidToken)).thenReturn(false);

        // Act
        ResponseEntity<?> responseEntity = controller.validateSession(invalidToken);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
        assertEquals("Invalid session token", responseEntity.getBody());
    }
}
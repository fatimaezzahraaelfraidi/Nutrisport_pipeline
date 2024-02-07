package com.example.usermanagementservice.dto;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationResponseTest {
    @Test
    public void testJwtAuthenticationResponseBuilder() {
        // Create a JwtAuthenticationResponse using the builder
        JwtAuthenticationResponse jwtAuthenticationResponse = JwtAuthenticationResponse.builder()
                .token("tokenValue")
                .sessionToken("sessionTokenValue")
                .sessionId(123L)
                .userFullName("John Doe")
                .userMail("john.doe@example.com")
                .role("ROLE_USER")
                .phone("1234567890")
                .build();

        // Test that the JwtAuthenticationResponse object is not null
        assertNotNull(jwtAuthenticationResponse);

        // Test the values set by the builder
        assertEquals("tokenValue", jwtAuthenticationResponse.getToken());
        assertEquals("sessionTokenValue", jwtAuthenticationResponse.getSessionToken());
        assertEquals(123L, jwtAuthenticationResponse.getSessionId());
        assertEquals("John Doe", jwtAuthenticationResponse.getUserFullName());
        assertEquals("john.doe@example.com", jwtAuthenticationResponse.getUserMail());
        assertEquals("ROLE_USER", jwtAuthenticationResponse.getRole());
        assertEquals("1234567890", jwtAuthenticationResponse.getPhone());
    }
    @Test
    public void testDataAnnotation() {
        // Create a JwtAuthenticationResponse object
        JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse();

        // Set values using setter methods
        jwtAuthenticationResponse.setToken("tokenValue");
        jwtAuthenticationResponse.setSessionToken("sessionTokenValue");
        jwtAuthenticationResponse.setSessionId(123L);
        jwtAuthenticationResponse.setUserFullName("John Doe");
        jwtAuthenticationResponse.setUserMail("john.doe@example.com");
        jwtAuthenticationResponse.setRole("ROLE_USER");
        jwtAuthenticationResponse.setPhone("1234567890");

        // Test getter methods
        assertEquals("tokenValue", jwtAuthenticationResponse.getToken());
        assertEquals("sessionTokenValue", jwtAuthenticationResponse.getSessionToken());
        assertEquals(123L, jwtAuthenticationResponse.getSessionId());
        assertEquals("John Doe", jwtAuthenticationResponse.getUserFullName());
        assertEquals("john.doe@example.com", jwtAuthenticationResponse.getUserMail());
        assertEquals("ROLE_USER", jwtAuthenticationResponse.getRole());
        assertEquals("1234567890", jwtAuthenticationResponse.getPhone());
    }
    @Test
    public void testNoArgsConstructor() {
        // Create a JwtAuthenticationResponse object using the no-args constructor
        JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse();

        // Verify that the object is not null
        assertNotNull(jwtAuthenticationResponse);
    }
    @Test
    public void testTokenConstructor() {
        // Define a token value
        String token = "sampleTokenValue";

        // Create a JwtAuthenticationResponse object using the constructor with token parameter
        JwtAuthenticationResponse jwtAuthenticationResponse = new JwtAuthenticationResponse(token);

        // Verify that the token field is properly set
        assertEquals(token, jwtAuthenticationResponse.getToken());
    }
}
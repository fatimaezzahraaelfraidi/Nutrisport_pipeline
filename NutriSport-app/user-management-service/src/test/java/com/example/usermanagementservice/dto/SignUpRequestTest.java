package com.example.usermanagementservice.dto;

import com.example.usermanagementservice.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class SignUpRequestTest {

    @Test
    public void testSignUpRequestConstructorAndGetters() {
        // Create a User object
        User user = new User();
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe@example.com");
        user.setPhone("123456789");

        // Create a SignUpRequest object
        SignUpRequest signUpRequest = new SignUpRequest(user, "john.doe@example.com", "password", "ROLE_USER", "1234567890");

        // Test getters
        assertNotNull(signUpRequest.getUser());
        assertEquals("john.doe@example.com", signUpRequest.getEmail());
        assertEquals("password", signUpRequest.getPassword());
        assertEquals("ROLE_USER", signUpRequest.getRole());
        assertEquals("1234567890", signUpRequest.getCinNumber());

        // Test User object within SignUpRequest
        assertEquals("John", signUpRequest.getUser().getFirstName());
        assertEquals("Doe", signUpRequest.getUser().getLastName());
        assertEquals("john.doe@example.com", signUpRequest.getUser().getEmail());
        assertEquals("123456789", signUpRequest.getUser().getPhone());
    }
    @Test
    public void testSignUpRequestBuilder() {
        // Create a SignUpRequest using the builder
        SignUpRequest signUpRequest = SignUpRequest.builder()
                .user(User.builder()
                        .firstName("John")
                        .lastName("Doe")
                        .email("john.doe@example.com")
                        .phone("123456789")
                        .build())
                .email("john.doe@example.com")
                .password("password")
                .role("ROLE_USER")
                .cinNumber("1234567890")
                .build();

        // Test that the SignUpRequest object is not null
        assertNotNull(signUpRequest);

        // Test the values set by the builder
        assertEquals("john.doe@example.com", signUpRequest.getEmail());
        assertEquals("password", signUpRequest.getPassword());
        assertEquals("ROLE_USER", signUpRequest.getRole());
        assertEquals("1234567890", signUpRequest.getCinNumber());
        assertEquals("John", signUpRequest.getUser().getFirstName());
        assertEquals("Doe", signUpRequest.getUser().getLastName());
        assertEquals("john.doe@example.com", signUpRequest.getUser().getEmail());
        assertEquals("123456789", signUpRequest.getUser().getPhone());
    }
}

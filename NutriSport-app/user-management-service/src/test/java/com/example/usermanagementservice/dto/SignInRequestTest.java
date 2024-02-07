package com.example.usermanagementservice.dto;

import com.example.usermanagementservice.model.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)

class SignInRequestTest {

    @Test
    public void testSignInRequestBuilder() {
        // Create a SignInRequest using the builder
        SignInRequest signInRequest = SignInRequest.builder()
                .login("john.doe@example.com")
                .password("password")
                .fcmToken("fcm_token")
                .build();

        // Test that the SignInRequest object is not null
        assertNotNull(signInRequest);

        // Test the values set by the builder
        assertEquals("john.doe@example.com", signInRequest.getLogin());
        assertEquals("password", signInRequest.getPassword());
        assertEquals("fcm_token", signInRequest.getFcmToken());
    }
    @Test
    public void testSignUpRequestBuilder() {
        // Create a User object
        User user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phone("1234567890")
                .build();

        // Create a SignUpRequest using the builder
        SignUpRequest signUpRequest = SignUpRequest.builder()
                .user(user)
                .email("john.doe@example.com")
                .password("password")
                .role("ROLE_CHEF")
                .cinNumber("123456789")
                .build();

        // Test that the SignUpRequest object is not null
        assertNotNull(signUpRequest);

        // Test the values set by the builder
        assertEquals(user, signUpRequest.getUser());
        assertEquals("john.doe@example.com", signUpRequest.getEmail());
        assertEquals("password", signUpRequest.getPassword());
        assertEquals("ROLE_CHEF", signUpRequest.getRole());
        assertEquals("123456789", signUpRequest.getCinNumber());
    }
    @Test
    public void testNoArgsConstructor() {
        // Create a JwtAuthenticationResponse object using the no-args constructor
        SignInRequest signInRequest = new SignInRequest();

        // Verify that the object is not null
        assertNotNull(signInRequest);
    }
    @Test
    public void testDataAnnotation() {
        // Define values for the fields
        String login = "testLogin";
        String password = "testPassword";
        String fcmToken = "testFcmToken";

        // Create an instance using the builder
        SignInRequest signInRequest = SignInRequest.builder()
                .login(login)
                .password(password)
                .fcmToken(fcmToken)
                .build();

        // Verify that fields are properly initialized via the builder
        assertEquals(login, signInRequest.getLogin());
        assertEquals(password, signInRequest.getPassword());
        assertEquals(fcmToken, signInRequest.getFcmToken());

        // Test setter methods
        String newLogin = "newTestLogin";
        signInRequest.setLogin(newLogin);
        assertEquals(newLogin, signInRequest.getLogin());

        // Test toString() method
        String expectedToString = "SignInRequest(login=" + newLogin + ", password=" + password + ", fcmToken=" + fcmToken + ")";
        assertEquals(expectedToString, signInRequest.toString());

        // Test equals() and hashCode() methods
        SignInRequest signInRequestCopy = SignInRequest.builder()
                .login(newLogin)
                .password(password)
                .fcmToken(fcmToken)
                .build();
        assertEquals(signInRequest, signInRequestCopy);
        assertEquals(signInRequest.hashCode(), signInRequestCopy.hashCode());
    }
}
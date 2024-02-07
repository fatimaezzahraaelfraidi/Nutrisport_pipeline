package com.example.usermanagementservice.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private UserDetails userDetails;





    // Creating an instance of JwtService for testing
    private   JwtService jwtService ;
    @Value("${token.secret.key}")
    String jwtSecretKey;
    @Value("${token.expirationms}:360000")
    Long jwtExpirationMs;
    @BeforeEach
    void setUp(){

        jwtService=new JwtService();

    }

    @Test
    void testGenerateToken() {
        // Set up any necessary mocks
        when(userDetails.getUsername()).thenReturn("testUser");

        // Call the method to generate token
        String token = jwtService.generateToken(userDetails);

        // Add assertions or print statements to check the token's expiration date
        // For example, you can print the expiration date and jwtExpirationMs value
        Date expirationDate = new Date(System.currentTimeMillis() + jwtService.jwtExpirationMs);
        System.out.println("Expiration Date: " + expirationDate);
        System.out.println("jwtExpirationMs value: " + jwtService.jwtExpirationMs);

        // Or you can assert that the expiration date is not null
        assertNotNull(expirationDate, "Expiration date should not be null");
    }
    @Test
    public void testIsTokenValid() {
        // Mocking UserDetails.getUsername() method
        when(userDetails.getUsername()).thenReturn("testUser");

        // Generating token
        String token = jwtService.generateToken(userDetails);

        // Checking if token is valid for the provided UserDetails
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Asserting that the token is valid
        assertEquals(true, isValid);
    }
    @Test
    public void testGetSigningKey() {
        // Mocking jwtSecretKey
        String secretKey = "your_secret_key_here";

        // Setting the mocked value in JwtService
        jwtService.jwtSecretKey = secretKey;

        // Calculating expected Key
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        Key expectedKey = Keys.hmacShaKeyFor(keyBytes);

        // Getting the actual Key from the method
        Key actualKey = jwtService.getSigningKey();

        // Verifying if the actual and expected keys are equal
        assertEquals(expectedKey, actualKey);
    }
}
package com.example.usermanagementservice.controller;

import com.example.usermanagementservice.dto.JwtAuthenticationResponse;
import com.example.usermanagementservice.dto.SignInRequest;
import com.example.usermanagementservice.dto.SignUpRequest;
import com.example.usermanagementservice.exception.AccountException;
import com.example.usermanagementservice.model.*;
import com.example.usermanagementservice.service.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserManagementControllerTest {
    @Mock
    private ChefService chefService;

    @Mock
    private SportifService sportifService;

    @Mock
    private AccountService accountService;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private SessionService sessionService;
    @Mock
    private PageEventProducer pageEventProducer;

    @InjectMocks
    private UserManagementController userManagementController;
    @Mock
    private LocationService locationService;

    @Mock
    private ObjectMapper objectMapper;

    private SignUpRequest signUpRequest;
    private SignInRequest signInRequest;

    @BeforeEach
    void setUp() {
        signUpRequest = new SignUpRequest();
        // Initialize signUpRequest fields if needed

        signInRequest = new SignInRequest();
        validToken = "validToken";
        invalidToken = "invalidToken";
    }


    private String validToken;
    private String invalidToken;



    @Test
    void logout_ValidToken_ReturnOkResponse() throws JsonProcessingException {
        Session session = new Session();
        session.setId(1L);
        // Set up the session as needed

        when(sessionService.getSessionByToken(validToken.substring(7))).thenReturn(Optional.of(session));

        ResponseEntity<String> response = userManagementController.logout("Bearer " + validToken);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Logout successful", response.getBody());
        verify(sessionService, times(1)).save(session);

    }

    @Test
    void logout_InvalidToken_ReturnUnauthorizedResponse() throws JsonProcessingException {
        when(sessionService.getSessionByToken(invalidToken.substring(7))).thenReturn(Optional.empty());

        ResponseEntity<String> response = userManagementController.logout("Bearer " + invalidToken);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Invalid session", response.getBody());
        verify(sessionService, never()).save(any(Session.class));
    }
    @Test
    void signup_ValidRequest_ReturnJwtAuthenticationResponse() throws AccountException {
        JwtAuthenticationResponse expectedResponse = new JwtAuthenticationResponse("token");
        when(authenticationService.signup(any(SignUpRequest.class))).thenReturn(expectedResponse);

        JwtAuthenticationResponse response = userManagementController.signup(signUpRequest);

        assertEquals(expectedResponse, response);
        verify(authenticationService, times(1)).signup(signUpRequest);
    }

    @Test
    void signin_ValidRequest_ReturnJwtAuthenticationResponse() {
        JwtAuthenticationResponse expectedResponse = new JwtAuthenticationResponse("token");
        when(authenticationService.signin(any(SignInRequest.class))).thenReturn(expectedResponse);

        JwtAuthenticationResponse response = userManagementController.signin(signInRequest);

        assertEquals(expectedResponse, response);
        verify(authenticationService, times(1)).signin(signInRequest);
    }
    @Test
    void chefs_ReturnListOfChefs() {
        // Mock data
        List<Chef> expectedChefs = Arrays.asList(new Chef(), new Chef(), new Chef());
        when(chefService.allChefs()).thenReturn(expectedChefs);

        // Call the method
        ResponseEntity<List<Chef>> responseEntity = (ResponseEntity<List<Chef>>) userManagementController.chefs();

        // Assertions
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedChefs, responseEntity.getBody());
    }

    @Test
    void sportifs_ReturnListOfSportifs() {
        // Mock data
        List<Sportif> expectedSportifs = Arrays.asList(new Sportif(), new Sportif());
        when(sportifService.allSportifs()).thenReturn(expectedSportifs);

        // Call the method
        ResponseEntity<List<Sportif>> responseEntity = (ResponseEntity<List<Sportif>>) userManagementController.sportifs();

        // Assertions
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedSportifs, responseEntity.getBody());
    }

    @Test
    void accounts_ReturnListOfAccounts() {
        // Mock data
        List<Account> expectedAccounts = Arrays.asList(new Account(), new Account());
        when(accountService.allAccounts()).thenReturn(expectedAccounts);

        // Call the method
        ResponseEntity<List<Account>> responseEntity = (ResponseEntity<List<Account>>) userManagementController.accounts();

        // Assertions
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedAccounts, responseEntity.getBody());
    }
    @Test
    void testSaveSessionLocation_ValidSession() throws JsonProcessingException {
        String token = "valid_token";
        String latStr = "10.12345";
        String lonStr = "20.67890";

        Session session = new Session();
        session.setId(1L);
        session.setAccount(new Account());
        Location location = new Location();
        when(sessionService.getSessionByToken(anyString())).thenReturn(java.util.Optional.of(session));

        ResponseEntity<String> responseEntity = userManagementController.saveSessionLocation(token, latStr, lonStr);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals("Save location successful", responseEntity.getBody());
        verify(sessionService, times(1)).saveAndFlush(any(Session.class));
        verify(locationService, times(1)).saveAndFlush(any(Location.class));
        verify(pageEventProducer, times(1)).sendSessionLocationEvent(anyString());
    }
    @Test
    void testSaveSessionLocation_InvalidSession() throws JsonProcessingException {
        String token = "invalid_token";
        String latStr = "10.12345";
        String lonStr = "20.67890";

        when(sessionService.getSessionByToken(anyString())).thenReturn(java.util.Optional.empty());

        ResponseEntity<String> responseEntity = userManagementController.saveSessionLocation(token, latStr, lonStr);

        assertEquals(HttpStatus.UNAUTHORIZED, responseEntity.getStatusCode());
        assertEquals("Invalid session", responseEntity.getBody());
        verifyNoInteractions(locationService, objectMapper, pageEventProducer);
    }

    @Test
    void testSaveSessionLocation_InvalidLatitudeLongitudeFormat() throws JsonProcessingException {
        String token = "valid_token";
        String latStr = "invalid_lat";
        String lonStr = "20.67890";

        ResponseEntity<String> responseEntity = userManagementController.saveSessionLocation(token, latStr, lonStr);

        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode());
        assertEquals("Invalid latitude or longitude format", responseEntity.getBody());
        verifyNoInteractions(sessionService, locationService, objectMapper, pageEventProducer);
    }

    @Test
    void testSaveSessionLocation_ErrorProcessingMessage() throws JsonProcessingException {
        String token = "valid_token";
        String latStr = "10.12345";
        String lonStr = "20.67890";
        ArrayList<String>   auth = new ArrayList<>();
        auth.add("ROLE_CHEF");

        Session session = new Session();
        session.setAccount(new Account()); // Ensure account is not null

        when(sessionService.getSessionByToken(anyString())).thenReturn(java.util.Optional.of(session));
        when(objectMapper.writeValueAsString(any())).thenThrow(JsonProcessingException.class);

        ResponseEntity<String> responseEntity = userManagementController.saveSessionLocation(token, latStr, lonStr);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, responseEntity.getStatusCode());
        assertEquals("Error processing message", responseEntity.getBody());
        verify(locationService, times(1)).saveAndFlush(any());
        verify(sessionService, times(1)).saveAndFlush(any());
        verify(pageEventProducer, never()).sendSessionLocationEvent(anyString());
    }

}
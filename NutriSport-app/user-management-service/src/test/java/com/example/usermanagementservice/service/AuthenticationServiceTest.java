package com.example.usermanagementservice.service;

import com.example.usermanagementservice.dto.JwtAuthenticationResponse;
import com.example.usermanagementservice.dto.SignInRequest;
import com.example.usermanagementservice.dto.SignUpRequest;
import com.example.usermanagementservice.exception.AccountException;
import com.example.usermanagementservice.model.Account;
import com.example.usermanagementservice.model.Chef;
import com.example.usermanagementservice.model.Session;
import com.example.usermanagementservice.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {
    @Mock
    private  AccountRepository accountRepository;
    @Mock
    private ChefRepository chefRepository;
    @Mock
    private SportifRepository  sportifRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SessionRepository sessionRepository;
    private  AccountService accountService;
    private  PasswordEncoder passwordEncoder;
    private  JwtService jwtService;
    private  AuthenticationManager authenticationManager;
    private  SessionService sessionService;
    private   ChefService chefService;
    private  SportifService sportifService;
    private  AuthenticationService authenticationService;
    @Mock
    private  PageEventProducer pageEventProducer;

    @BeforeEach
    void setUp(){

        authenticationService=new AuthenticationService(accountRepository,accountService,passwordEncoder,jwtService,authenticationManager,sessionService,chefService,sportifService);
        accountService=new AccountService(accountRepository);
        sportifService=new SportifService(sportifRepository,userRepository);
        chefService=new ChefService(userRepository,chefRepository);
        sessionService=new SessionService(sessionRepository,pageEventProducer);
        jwtService=new JwtService();

    }
    @Test
    public void testSignupChef() throws AccountException {
        // Mocking signup request
        SignUpRequest signUpRequest = new SignUpRequest();
        signUpRequest.setEmail("chef@example.com");
        signUpRequest.setPassword("password");
        signUpRequest.setRole("ROLE_CHEF");
        Chef chef = new Chef();
        // Mocking chefService.saveChef()
        when(chefService.saveChef("name", "name","chef@example.com", "06655555", "sssss")).thenReturn(chef);


        // Mocking accountService.save()
        when(accountService.save(any())).thenReturn(new Account());

        // Mocking jwtService.generateToken()
        when(jwtService.generateToken(any())).thenReturn("jwtToken");

        // Perform signup
        JwtAuthenticationResponse response = authenticationService.signup(signUpRequest);

        // Verify the response
        assertEquals("jwtToken", response.getToken());
        assertEquals("ROLE_CHEF", response.getRole());
    }

    @Test
    public void testSignin() {
        // Mocking signin request
        SignInRequest signInRequest = new SignInRequest();
        signInRequest.setLogin("user@example.com");
        signInRequest.setPassword("password");

        // Mocking authenticationManager.authenticate()
        when(authenticationManager.authenticate(any())).thenReturn(null);

        // Mocking accountRepository.findByLogin()
        Account account = new Account();
        when(accountRepository.findByLogin(any())).thenReturn(Optional.of(account));

        // Mocking jwtService.generateToken()
        when(jwtService.generateToken(any())).thenReturn("jwtToken");

        // Mocking sessionService.createSession()
        Session session = new Session();
        when(sessionService.createSession(null, "name","chef@example.com", null,null,true)).thenReturn(session);

        // Perform signin
        JwtAuthenticationResponse response = authenticationService.signin(signInRequest);

        // Verify the response
        assertEquals("jwtToken", response.getToken());
        // Add more assertions as needed
    }}
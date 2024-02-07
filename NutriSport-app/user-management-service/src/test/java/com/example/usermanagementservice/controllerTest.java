//package com.example.usermanagementservice;
//
//import com.example.usermanagementservice.controller.UserManagementController;
//import com.example.usermanagementservice.dto.JwtAuthenticationResponse;
//import com.example.usermanagementservice.dto.SignInRequest;
//import com.example.usermanagementservice.dto.SignUpRequest;
//import com.example.usermanagementservice.exception.AccountException;
//import com.example.usermanagementservice.model.*;
//import com.example.usermanagementservice.repository.*;
//import com.example.usermanagementservice.service.*;
//import org.junit.*;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.*;
//import org.mockito.Mock;
//
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//import java.util.ArrayList;
//import java.util.Arrays;
//import java.util.List;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//public class controllerTest {
////    @Mock
////    PasswordEncoder passwordEncoder ;
////    @Mock
////    PageEventProducer pageEventProducer;
////    @Mock
////    private  SessionRepository sessionRepository;
////    @Mock
////    private  LocationRepository  locationRepository;
////    @Mock
////    private AccountRepository accountRepo;
////    @Mock
////    private ChefRepository chefRepository;
////    @Mock
////    private SportifRepository sportifRepository;
////    @InjectMocks
////    private UserRepository userRepository;
////    @Mock
////    private AuthenticationManager authenticationManager;
////    @InjectMocks
////    private SportifService sportifService=new SportifService(sportifRepository,userRepository);
////    @InjectMocks
////    private LocationService locationService=new LocationService(locationRepository);
////    @InjectMocks
////    private ChefService chefService =new ChefService(userRepository,chefRepository);
////
////    @InjectMocks
////    private JwtService jwtService =new JwtService();
////
////    @InjectMocks
////    private SessionService sessionService =new SessionService(sessionRepository,pageEventProducer);
////
////    @InjectMocks
////    private AccountService accountService =new AccountService(accountRepo);
////    @InjectMocks
////    private AuthenticationService authenticationService= new AuthenticationService(accountRepo,accountService,passwordEncoder,
////                                                            jwtService,authenticationManager,sessionService,chefService,sportifService);
////    @InjectMocks
////    private UserManagementController userManagementController= new UserManagementController(sportifService,chefService,authenticationService,sessionService,accountService,locationService,pageEventProducer);
////    @BeforeEach
////    void setUp() {
////        MockitoAnnotations.initMocks(this);
////    }
////
////
////    @Test
////    public void testSignup() throws AccountException {
////        SignUpRequest signUpRequest = new SignUpRequest();
////        JwtAuthenticationResponse expectedResponse = new JwtAuthenticationResponse("token");
////
////        when(authenticationService.signup(signUpRequest)).thenReturn(expectedResponse);
////
////        JwtAuthenticationResponse actualResponse = userManagementController.signup(signUpRequest);
////
////        assertEquals(expectedResponse, actualResponse);
////        verify(authenticationService, times(1)).signup(signUpRequest);
////    }
////
////    @Test
////    public void testSignin() {
////        SignInRequest signInRequest = new SignInRequest();
////        JwtAuthenticationResponse expectedResponse = new JwtAuthenticationResponse("token");
////
////        when(authenticationService.signin(signInRequest)).thenReturn(expectedResponse);
////
////        JwtAuthenticationResponse actualResponse = userManagementController.signin(signInRequest);
////
////        assertEquals(expectedResponse, actualResponse);
////        verify(authenticationService, times(1)).signin(signInRequest);
////    }
////
//////    @Test
//////    void testLogout() {
//////        String token = "Bearer abc123";
//////        Session session = new Session();
//////        session.setIsAuthenticated(true);
//////
//////        when(sessionService.getSessionByToken("abc123")).thenReturn(java.util.Optional.of(session));
//////        when(sessionService.save(any(Session.class))).thenReturn(session);
//////
//////        ResponseEntity<String> responseEntity = userManagementController.logout(token);
//////
//////        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//////        assertEquals("Logout successful", responseEntity.getBody());
//////        verify(sessionService, times(1)).save(session);
//////    }
////
////    @Test
////    public void testGetSessions() {
////        Long accountId = 1L;
////        List<Session> sessions = Arrays.asList(new Session(), new Session());
////
////        when(sessionService.getSessionsByAccountId(accountId)).thenReturn(sessions);
////
////        ResponseEntity<List<Session>> responseEntity = userManagementController.getSessions(accountId);
////
////        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
////        assertEquals(sessions, responseEntity.getBody());
////        verify(sessionService, times(1)).getSessionsByAccountId(accountId);
////    }
////
////    @Test
////    public void testChefs() {
////        List<Chef> chefs = Arrays.asList(new Chef(), new Chef());
////
////        when(chefService.allChefs()).thenReturn(chefs);
////
////        List<Chef> result = userManagementController.chefs();
////
////        assertEquals(chefs, result);
////        verify(chefService, times(1)).allChefs();
////    }
////
////    @Test
////    public void testSportifs() {
////
////        Sportif sportif= new Sportif("test","test","test","test");
////        List<Sportif> sportifs =new ArrayList<>();
////        sportifs.add(sportif);
////        when(sportifRepository.findAll()).thenReturn(sportifs);
////        when(sportifService.allSportifs()).thenReturn(sportifs);
////        when(sportifRepository.findAll()).thenReturn(sportifs);
////        List<Sportif> result = userManagementController.sportifs();
////
////        assertEquals(sportifs, result);
////        verify(sportifService, times(1)).allSportifs();
////    }
////
////    @Test
////    public void testAccounts() {
////        List<Account> accounts = Arrays.asList(new Account(), new Account());
////
////        when(accountService.allAccounts()).thenReturn(accounts);
////
////        List<Account> result = userManagementController.accounts();
////
////        assertEquals(accounts, result);
////        verify(accountService, times(1)).allAccounts();
////    }
////}
//
//
//    @Mock
//    private SessionService sessionService;
//
//    @InjectMocks
//    private UserManagementController userManagementController;
//
//    @BeforeEach
//    void setUp() {
//        MockitoAnnotations.initMocks(this);
//    }
//
//    @Test
//    public void testGetSessions() {
//        Long accountId = 1L;
//        List<Session> sessions = Arrays.asList(new Session(), new Session());
//
//        when(sessionService.getSessionsByAccountId(accountId)).thenReturn(sessions);
//
//        ResponseEntity<List<Session>> responseEntity = userManagementController.getSessions(accountId);
//
//        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
//        assertEquals(sessions, responseEntity.getBody());
//        verify(sessionService, times(1)).getSessionsByAccountId(accountId);
//    }
//}

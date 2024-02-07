package com.example.usermanagementservice.service;


import com.example.usermanagementservice.dto.JwtAuthenticationResponse;
import com.example.usermanagementservice.dto.SignInRequest;
import com.example.usermanagementservice.dto.SignUpRequest;
import com.example.usermanagementservice.exception.AccountException;
import com.example.usermanagementservice.model.*;
import com.example.usermanagementservice.repository.AccountRepository;
import com.example.usermanagementservice.repository.UserRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class AuthenticationService {
    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SessionService sessionService;
    private  final ChefService chefService;
    private final SportifService sportifService;
    @Value("${token.expirationms}")
    Long jwtExpirationMs;
    public JwtAuthenticationResponse signup(SignUpRequest request) throws AccountException {
        if (accountRepository.findByLogin(request.getEmail()).isPresent()) {
            throw new AccountException("User already registred");
        }
        if(request.getRole().equals("ROLE_CHEF")){
            var chef=chefService.saveChef(request.getUser().getFirstName(),request.getUser().getLastName(),
            request.getUser().getEmail(),request.getUser().getPhone(),request.getCinNumber());

            var account = Account
                    .builder()
                    .login(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .creationDate(new Date(System.currentTimeMillis()))
                    .user(chef)
                    .build();

            account = accountService.save(account);
            var jwt = jwtService.generateToken(account);

            return JwtAuthenticationResponse.builder()
                    .token(jwt)
                    .role("ROLE_CHEF")
                    .build();
        }
        else {
            System.out.println("in preparator");
            var sportif= sportifService.saveSportif(request.getUser().getFirstName(),request.getUser().getLastName(),
            request.getUser().getEmail(),request.getUser().getPhone());


            var account = Account
                    .builder()
                    .login(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .creationDate(new Date(System.currentTimeMillis()))
                    .user(sportif)
                    .build();

            account = accountService.save(account);
            var jwt = jwtService.generateToken(account);

            return JwtAuthenticationResponse.builder()
                    .token(jwt)
                    .role("ROLE_SPORTIF")
                    .build();
        }
        }


    public JwtAuthenticationResponse signin(SignInRequest request) {
//        try {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword()));

        var account = accountRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        var jwt = jwtService.generateToken(account);
        var fcmToken = request.getFcmToken();
        Date startTime = new Date();
        Date endTime = new Date(System.currentTimeMillis() + jwtExpirationMs);
        Session session = sessionService.createSession(account, jwt,fcmToken, startTime, endTime,true);

        // Return JWT and session token in the response
        return JwtAuthenticationResponse.builder()
                .token(jwt)
                .sessionId(session.getId())
                .userMail(session.getAccount().getUsername())
                .userFullName(session.getAccount().getUser().getFirstName()+" "+session.getAccount().getUser().getLastName())
                .sessionToken(session.getToken())
                .role(account.getAuthorities().toString())
                .phone(session.getAccount().getUser().getPhone())
                .build();
    }
    public boolean isValidSessionToken(String sessionToken) {
        try {
            // Extract the expiration time from the session token stored in the database
            Optional<Session> sessionOptional = sessionService.getSessionByToken(sessionToken);
            if (sessionOptional.isPresent()) {
                Date expirationTime = sessionOptional.get().getEndTime();
                // Check if the token has expired
                return !expirationTime.before(new Date());
            }
        } catch (Exception e) {
            // Handle any exceptions that might occur during validation
            // Log the error or return false based on your use case
            return false;
        }
        // If session not found or any other exception occurred, consider the token invalid
        return false;
    }

}

package com.example.usermanagementservice.controller;

import com.example.usermanagementservice.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-management/authentication")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @Autowired
    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @GetMapping("/validate-session")
    public ResponseEntity<?> validateSession(@RequestParam("sessionToken") String sessionToken) {
        // Validate session token using your AuthenticationService
        if (authenticationService.isValidSessionToken(sessionToken)) {
            return ResponseEntity.ok("Session token is valid");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid session token");
        }
    }
}
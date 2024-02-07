package com.example.usermanagementservice.controller;
import com.example.usermanagementservice.dto.JwtAuthenticationResponse;
import com.example.usermanagementservice.dto.SignInRequest;
import com.example.usermanagementservice.dto.SignUpRequest;
import com.example.usermanagementservice.exception.AccountException;
import com.example.usermanagementservice.model.*;
import com.example.usermanagementservice.service.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-management")
@RequiredArgsConstructor
public class UserManagementController {
    private final SportifService sportifService;
    private final ChefService chefService;
    private final AuthenticationService authenticationService;
    private final SessionService sessionService;
    private final AccountService accountService;
    private final LocationService locationService;
    private final PageEventProducer pageEventProducer;

    @PostMapping("/signup")
    public JwtAuthenticationResponse signup(@RequestBody SignUpRequest request) throws AccountException {
        System.out.println("call signup with :" +request.toString());
        return authenticationService.signup(request);
    }

    @PostMapping("/signin")
    public JwtAuthenticationResponse signin(@RequestBody SignInRequest request) {
        System.out.println("call signin with :" +request.toString());
        return authenticationService.signin(request);
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) throws JsonProcessingException {
        Session session = sessionService.getSessionByToken(token.substring(7)).orElse(null);
        if (session != null) {
            session.setIsAuthenticated(false);
            Session sessionLogOut = sessionService.save(session);

            System.out.println("sessionLogOut"+ sessionLogOut);

                String message = new ObjectMapper().writeValueAsString(
                        Map.of(
                                "authorities", session.getAccount().getAuthorities(),
                                "id", session.getId()
                        )
                );
                // Send the message
                pageEventProducer.sendSessionLogOut(message);
                System.out.println("sendlogout kafka"+message );


            return ResponseEntity.ok("Logout successful");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid session");
        }
    }
    @GetMapping("/get/{accountId}/sessions")
    public ResponseEntity<List<Session>> getSessions(@PathVariable Long accountId) {
        return ResponseEntity.ok(sessionService.getSessionsByAccountId(accountId));
    }
    @GetMapping("/chefs")
    public List<Chef> chefs(){
       return chefService.allChefs();
    }
    @GetMapping("/sportifs")
    public List<Sportif> sportifs(){
        return sportifService.allSportifs();
    }
    @GetMapping("/accounts")
    public List<Account> accounts(){
        return accountService.allAccounts();
    }

    @PostMapping("/saveLocationSession/{latStr},{lonStr}")
    public ResponseEntity<String> saveSessionLocation(@RequestHeader("Authorization") String token, @PathVariable String latStr, @PathVariable String lonStr) {
        try {
            Session session = sessionService.getSessionByToken(token.substring(7)).orElse(null);
            if (session != null) {
                double lat = Double.parseDouble(latStr);
                double lon = Double.parseDouble(lonStr);
                GeometryFactory geometryFactory = new GeometryFactory();
                Coordinate coordinate = new Coordinate(lon, lat);
                Point point = geometryFactory.createPoint(coordinate);
                Location location = session.getLocation();
                if (location == null) {
                    location = new Location(); // Instantiate a new Location if not already present
                }
                location.setLocationGeometry(point);
                locationService.saveAndFlush(location);
                session.setLocation(location);
                sessionService.saveAndFlush(session);

                String message = new ObjectMapper().writeValueAsString(
                        Map.of(
                                "id", session.getId(),
                                "latitude", lat,
                                "longitude", lon,
                                "authorities", session.getAccount().getAuthorities()
                        )
                );
                System.out.println("Send location session: " + message);
                pageEventProducer.sendSessionLocationEvent(message);

                return ResponseEntity.ok("Save location successful");
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid session");
        } catch (NumberFormatException e) {return ResponseEntity.badRequest().body("Invalid latitude or longitude format");} catch (JsonProcessingException e) {return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing message");}}}

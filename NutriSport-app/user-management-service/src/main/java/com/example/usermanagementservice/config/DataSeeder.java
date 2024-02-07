package com.example.usermanagementservice.config;
import com.example.usermanagementservice.model.*;
import com.example.usermanagementservice.repository.AccountRepository;
import com.example.usermanagementservice.repository.LocationRepository;
import com.example.usermanagementservice.service.ChefService;
import com.example.usermanagementservice.service.SportifService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.usermanagementservice.config.PasswordConfig.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
@AllArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    @Autowired
    private final LocationRepository locationRepository;
    @Autowired
    private ChefService chefService;
    @Autowired
    private SportifService sportifService;
    @Autowired
    private AccountRepository accountRepository;

    private PasswordEncoder passwordEncoder;


    @Override
    public void run(String... args) throws Exception {

        // Check if data exists in the database
        if (!dataAlreadyExists()) {
            // Insert data into the database
            insertData();
        }
        else System.out.println("data exist");
    }
    private boolean dataAlreadyExists() {
        return locationRepository.count() > 0;
    }


    private void insertData() {
        GeometryFactory geometryFactory = new GeometryFactory();

        // Create Locations
        Location ll1 = saveLocation(geometryFactory, new Coordinate(33.599154, -7.615456));
        Location ll2 = saveLocation(geometryFactory, new Coordinate(33.605531, -7.632723));
        Location ll3 = saveLocation(geometryFactory, new Coordinate(33.593729, -7.568729));

        // Create Chef1
        Chef chef1 = createChef("zineb", "frikhi", "061235887", 0.0, "frikhi@nutrisport.com","TK123456");
        saveUserAndSessions(chef1, "frikhi@nutrisport.com", passwordEncoder.encode("password123"), ll1);
        // Create Chef2
        Chef chef2 = createChef("khaoula", "bel", "0657895", 0.0, "bell@nutrisport.com","TK123456");
        saveUserAndSessions(chef2, "bell@nutrisport.com", passwordEncoder.encode("password123"), ll3);

        // Create Sportif1
        Sportif sportif1 = createSportif("fati", "el fraidi", "061235887", 65.0, "elfraidi@nutrisport.com");
        saveUserAndSessions(sportif1, "elfraidi@nutrisport.com", passwordEncoder.encode("password123"), ll2);
    }

    private Location saveLocation(GeometryFactory geometryFactory, Coordinate coordinate) {
        Point point = geometryFactory.createPoint(coordinate);
        Location location = new Location();
        location.setLocationGeometry(point);
        return locationRepository.save(location);
    }


    private Chef createChef(String firstName, String lastName, String phone, Double rank, String email, String cinNumber) {
        Chef chef = new Chef();
        chef.setFirstName(firstName);
        chef.setLastName(lastName);
        chef.setPhone(phone);
        chef.setRank(rank);
        chef.setEmail(email);
        chef.setCinNumber(cinNumber);
        return chefService.saveChef(chef);
    }

    private Sportif createSportif(String firstName, String lastName, String phone, Double weight, String email) {
        Sportif sportif = new Sportif();
        sportif.setFirstName(firstName);
        sportif.setLastName(lastName);
        sportif.setPhone(phone);
        sportif.setWeight(weight);
        sportif.setEmail(email);
        return sportifService.saveSportif(sportif);
    }
    @Transactional
    public void saveUserAndSessions(User user, String login, String password, Location location) {
        Account account = new Account();
        account.setLogin(login);
        account.setPassword(password);
        account.setCreationDate(new Date());
        account.setUser(user);

        Session session = new Session();
        session.setAccount(account);
        //session.setLocation(location);
        //location.setSession(session);

        List<Session> sessions = new ArrayList<>();
        sessions.add(session);

      //  account.setSessions(sessions);

        accountRepository.save(account);
    }
}

package com.example.usermanagementservice.service;
import com.example.usermanagementservice.model.Chef;
import com.example.usermanagementservice.model.Sportif;
import com.example.usermanagementservice.repository.SportifRepository;
import com.example.usermanagementservice.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@NoArgsConstructor
public class SportifService {
    @Autowired
    private SportifRepository sportifRepository;
    @Autowired
    private UserRepository userRepository;

    public Sportif saveSportif(Sportif sportif) {
        // Save the User part of Sportif (which is also a User)
        userRepository.save(sportif);

        // Save the Sportif-specific details
        return sportifRepository.save(sportif);
    }
    public Sportif saveSportif(String firtName, String lastName, String email, String phone) {
        Sportif sportif=new Sportif(firtName,lastName,email,phone);
        // Save the User part of Chef (which is also a User)
        userRepository.save(sportif);

        // Save the Chef-specific details
        return sportifRepository.save(sportif);
    }
    public List<Sportif> allSportifs(){
        return sportifRepository.findAll();
    }
}


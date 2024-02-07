package com.example.usermanagementservice.service;
import com.example.usermanagementservice.model.Chef;
import com.example.usermanagementservice.repository.ChefRepository;
import com.example.usermanagementservice.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@NoArgsConstructor
public class ChefService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ChefRepository chefRepository;
    public Chef saveChef(Chef chef) {
        // Save the User part of Chef (which is also a User)
        userRepository.save(chef);

        // Save the Chef-specific details
        return chefRepository.save(chef);
    }
    public Chef saveChef(String firtName,String lastName,String email, String phone,String cinNumber) {
        Chef chef=new Chef(firtName,lastName,email,phone,cinNumber);
        // Save the User part of Chef (which is also a User)
        userRepository.save(chef);

        // Save the Chef-specific details
        return chefRepository.save(chef);
    }
    public List<Chef> allChefs(){
        return chefRepository.findAll();

    }
}


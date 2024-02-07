package com.example.usermanagementservice.model;

import com.example.usermanagementservice.service.AccountService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.junit.jupiter.api.Assertions.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SportifTest {

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AccountService accountService;

    @Test
    public void testSportifInitialization() {
        // Create a Sportif object
        Sportif sportif = new Sportif("John", "Doe", "john@example.com", "123456789");

        // Verify the initialization of properties
        assertEquals("John", sportif.getFirstName());
        assertEquals("Doe", sportif.getLastName());
        assertEquals("john@example.com", sportif.getEmail());
        assertEquals("123456789", sportif.getPhone());
        assertEquals("", sportif.getAllergies());
        assertEquals(null, sportif.getWeight()); // Weight is not set in the constructor

        // Set some values
        sportif.setWeight(75.5);
        sportif.setAllergies("Peanuts");

        // Verify the values after setting
        assertEquals(75.5, sportif.getWeight());
        assertEquals("Peanuts", sportif.getAllergies());
    }
    @Test
    public void testSportifInitialization2() {
        // Create a Sportif object using the all-args constructor
        Sportif sportif = new Sportif( 75.5, "Peanuts");


        assertEquals(75.5, sportif.getWeight());
        assertEquals("Peanuts", sportif.getAllergies());
    }

}
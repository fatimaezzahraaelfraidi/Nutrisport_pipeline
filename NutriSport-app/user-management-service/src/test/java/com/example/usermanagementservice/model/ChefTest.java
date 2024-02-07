package com.example.usermanagementservice.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class ChefTest {


    @Test
    void testIsAccountNonLocked() {
        // Create an Account object
        Account account = new Account();

        // Call the isAccountNonLocked() method and assert that it returns true
        assertTrue(account.isAccountNonLocked());
    }

    @Test
    void testIsCredentialsNonExpired() {
        // Create an Account object
        Account account = new Account();

        // Call the isCredentialsNonExpired() method and assert that it returns true
        assertTrue(account.isCredentialsNonExpired());
    }
    @Test
    void testAllArgsConstructor() {
        // Create test data
        String firstName = "John";
        String lastName = "Doe";
        String email = "john.doe@example.com";
        String phone = "123456789";
        String cinNumber = "123ABC";
        Double rank = 4.5; // Sample rank value

        // Create a Chef object using AllArgsConstructor
        Chef chef = new Chef(firstName, lastName, email, phone, cinNumber  );

        // Verify that the properties are correctly set
        assertEquals(firstName, chef.getFirstName());
        assertEquals(lastName, chef.getLastName());
        assertEquals(email, chef.getEmail());
        assertEquals(phone, chef.getPhone());
        assertEquals(cinNumber, chef.getCinNumber());
        assertEquals(rank, chef.getRank());
    }
}
package com.example.usermanagementservice.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class AccountTest {

    @Test
    void testGetAuthorities_Sportif() {
        // Create a Sportif user
        User user = new Sportif();
        Account account = new Account();
        account.setUser(user);

        // Get authorities
        Collection<? extends GrantedAuthority> authorities = account.getAuthorities();

        // Assert that the authorities contain "ROLE_SPORTIF"
        assertTrue(authorities.contains(new SimpleGrantedAuthority("ROLE_SPORTIF")));
    }

    @Test
    void testGetAuthorities_Chef() {
        // Create a Chef user
        User user = new Chef();
        Account account = new Account();
        account.setUser(user);

        // Get authorities
        Collection<? extends GrantedAuthority> authorities = account.getAuthorities();

        // Assert that the authorities contain "ROLE_CHEF"
        assertTrue(authorities.contains(new SimpleGrantedAuthority("ROLE_CHEF")));
    }

    @Test
    void testAccountBuilder() {
        // Create an Account using the builder
        Account account = Account.builder()
                .id(1L)
                .login("testLogin")
                .password("testPassword")
                .creationDate(new Date())
                .build();

        // Verify the values set by the builder
        assertEquals(1L, account.getId());
        assertEquals("testLogin", account.getLogin());
        assertEquals("testPassword", account.getPassword());
        assertNotNull(account.getCreationDate()); // Verify creation date is not null
    }
    @Test
    void testGettersAndSetters() {
        // Create an Account object
        Account account = new Account();

        // Set values using setters
        account.setId(1L);
        account.setLogin("testLogin");
        account.setPassword("testPassword");
        account.setCreationDate(new Date());
        User user = new User(); // Create a User object for testing
        account.setUser(user);

        // Verify values using getters
        assertEquals(1L, account.getId());
        assertEquals("testLogin", account.getLogin());
        assertEquals("testPassword", account.getPassword());
        assertNotNull(account.getCreationDate()); // Verify creation date is not null
        assertEquals(user, account.getUser());
    }
    @Test
    void testIsAccountNonExpired() {
        // Create an Account object
        Account account = new Account();

        // Call the isAccountNonExpired() method and assert that it returns true
        assertTrue(account.isAccountNonExpired());
    }
    @Test
    void testIsEnabled() {
        // Create an Account object
        Account account = new Account();

        // Call the isEnabled() method and assert that it returns true
        assertTrue(account.isEnabled());
    }
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
}

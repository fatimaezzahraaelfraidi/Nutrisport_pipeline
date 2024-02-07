package com.example.usermanagementservice.filters;

import com.example.usermanagementservice.service.AccountService;
import com.example.usermanagementservice.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {
    @Mock
    private JwtService jwtService;


    @Mock
    private AccountService accountService;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        filter = new JwtAuthenticationFilter(jwtService, accountService);

        // Mock setup for userDetailsService
        UserDetailsService userDetailsService = new UserDetailsService() {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                // You can return a mock UserDetails object here if needed
                if ("username".equals(username)) {
                    return User.withUsername("username").password("password").roles("USER").build();
                } else {
                    throw new UsernameNotFoundException("User not found");
                }
            }
        };
        when(accountService.userDetailsService()).thenReturn(userDetailsService);
    }

    @Test
    public void testDoFilterInternal_ValidToken() throws ServletException, IOException {
        // Arrange
        UserDetails userDetails = new User("username", "password", Collections.emptyList());
        when(jwtService.extractUserName(anyString())).thenReturn("username");
        when(accountService.userDetailsService()).thenReturn((UserDetailsService) s -> userDetails);
        when(jwtService.isTokenValid(anyString(), any(UserDetails.class))).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        // Act
        filter.doFilterInternal(request, response, filterChain);

        // Assert
        UsernamePasswordAuthenticationToken authenticationToken = (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        assertEquals("username", ((User) authenticationToken.getPrincipal()).getUsername());
        verify(filterChain).doFilter(request, response);
    }@Test
    public void testDoFilterInternal_InvalidToken() throws ServletException, IOException {
        // Arrange
        when(jwtService.extractUserName(anyString())).thenReturn("nonexistentUsername");
        when(accountService.userDetailsService().loadUserByUsername("nonexistentUsername")).thenThrow(new UsernameNotFoundException("User not found"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalidToken");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        // Act
        filter.doFilterInternal(request, response, filterChain);

        // Assert
        // Verify that the filter chain is invoked
        verify(filterChain).doFilter(request, response);

        // Verify that the SecurityContextHolder has no authentication
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }}
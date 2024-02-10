package com.example.usermanagementservice.config;

import com.example.usermanagementservice.model.Chef;
import com.example.usermanagementservice.model.Sportif;
import com.example.usermanagementservice.repository.AccountRepository;
import com.example.usermanagementservice.repository.LocationRepository;
import com.example.usermanagementservice.service.ChefService;
import com.example.usermanagementservice.service.SportifService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataSeederTest {

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private ChefService chefService;

    @Mock
    private SportifService sportifService;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DataSeeder dataSeeder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Test
    void testRun_DataExists() throws Exception {
        when(locationRepository.count()).thenReturn(1L);

        dataSeeder.run();

        verify(locationRepository).count();
        verifyNoInteractions(chefService, sportifService, accountRepository, passwordEncoder);
    }

    @Test
    void testRun_DataDoesNotExist() throws Exception {
        when(locationRepository.count()).thenReturn(0L);

        dataSeeder.run();

        verify(locationRepository).count();
        verify(chefService, times(2)).saveChef(any(Chef.class));
        verify(sportifService).saveSportif(any(Sportif.class));
        verify(accountRepository, times(3)).save(any());
        verify(passwordEncoder, times(3)).encode(anyString());
    }
}
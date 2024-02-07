package com.example.usermanagementservice.service;

import com.example.usermanagementservice.model.Sportif;
import com.example.usermanagementservice.repository.SportifRepository;
import com.example.usermanagementservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SportifServiceTest {
    @Mock
    private SportifRepository sportifRepository;
    @Mock
    private UserRepository userRepository;
    private SportifService sportifService;
    @BeforeEach
    void setUp(){

        sportifService=new SportifService(sportifRepository,userRepository);
    }
    @Test
    void saveSportif() {
        // Given
        Sportif sportifToSave = new Sportif("firstName","lastName","email@email.com","065478");

        // When
        sportifService.saveSportif(sportifToSave);

        // Then
        ArgumentCaptor<Sportif> sportifArgumentCaptor = ArgumentCaptor.forClass(Sportif.class);
        verify(userRepository).save(sportifArgumentCaptor.capture());
        verify(sportifRepository).save(sportifArgumentCaptor.capture());
        Sportif capturedSportif = sportifArgumentCaptor.getValue();
        assertThat(capturedSportif).isEqualTo(sportifToSave);
    }


    @Test
    void testSaveSportif() {
        // Given
        String firstName = "John";
        String lastName = "Doe";
        String email = "john.doe@example.com";
        String phone = "1234567890";

        // When
        sportifService.saveSportif(firstName, lastName, email, phone);

        // Then
        ArgumentCaptor<Sportif> sportifArgumentCaptor = ArgumentCaptor.forClass(Sportif.class);
        verify(userRepository).save(sportifArgumentCaptor.capture());
        verify(sportifRepository).save(sportifArgumentCaptor.capture());
        Sportif capturedSportif = sportifArgumentCaptor.getValue();
        assertThat(capturedSportif.getFirstName()).isEqualTo(firstName);
        assertThat(capturedSportif.getLastName()).isEqualTo(lastName);
        assertThat(capturedSportif.getEmail()).isEqualTo(email);
        assertThat(capturedSportif.getPhone()).isEqualTo(phone);
    }

    @Test
    void allSportifs() {
        // Given
        List<Sportif> sportifList = Arrays.asList(
                new Sportif(/* Initialize with necessary parameters */),
                new Sportif(/* Initialize with necessary parameters */)
        );
        when(sportifRepository.findAll()).thenReturn(sportifList);

        // When
        List<Sportif> retrievedSportifs = sportifService.allSportifs();

        // Then
        assertThat(retrievedSportifs).isNotNull();

    }
    @Test
    void testNoArgsConstructor() {
        // Create an instance using the no-argument constructor
        SportifService sportifService = new SportifService();

        // Assert that the instance is not null
        assertNotNull(sportifService);
    }

}
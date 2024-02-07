package com.example.usermanagementservice.service;

import com.example.usermanagementservice.model.Chef;
import com.example.usermanagementservice.repository.ChefRepository;
import com.example.usermanagementservice.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChefServiceTest {
    @Mock
    private ChefRepository chefRepository;
    @Mock
    private UserRepository userRepository;
    private  ChefService chefService;
    @BeforeEach
    void setUp(){

        chefService=new ChefService(userRepository,chefRepository);
    }


    @Test

    void saveChef() {
        // Given
        Chef chefToSave = new Chef("firstName","lastName","email@email.com","065478","eef5555");

        // When
        chefService.saveChef(chefToSave);

        // Then
        ArgumentCaptor<Chef> chefArgumentCaptor = ArgumentCaptor.forClass(Chef.class);
        verify(userRepository).save(chefArgumentCaptor.capture());
        verify(chefRepository).save(chefArgumentCaptor.capture());
        Chef capturedChef = chefArgumentCaptor.getValue();
        assertThat(capturedChef).isEqualTo(chefToSave);
    }

    @Test

    void testSaveChef() {
        // Given
        String firstName = "John";
        String lastName = "Doe";
        String email = "john.doe@example.com";
        String phone = "1234567890";
        String cinNumber = "ABC123456";

        // When
        chefService.saveChef(firstName, lastName, email, phone, cinNumber);

        // Then
        ArgumentCaptor<Chef> chefArgumentCaptor = ArgumentCaptor.forClass(Chef.class);
        verify(userRepository).save(chefArgumentCaptor.capture());
        verify(chefRepository).save(chefArgumentCaptor.capture());
        Chef capturedChef = chefArgumentCaptor.getValue();
        assertThat(capturedChef.getFirstName()).isEqualTo(firstName);
        assertThat(capturedChef.getLastName()).isEqualTo(lastName);
        assertThat(capturedChef.getEmail()).isEqualTo(email);
        assertThat(capturedChef.getPhone()).isEqualTo(phone);
        assertThat(capturedChef.getCinNumber()).isEqualTo(cinNumber);
    }

    @Test
    void allChefs() {
        // Given
        List<Chef> chefList = Arrays.asList(
                new Chef(/* Initialize with necessary parameters */),
                new Chef(/* Initialize with necessary parameters */)
        );
        when(chefRepository.findAll()).thenReturn(chefList);

        // When
        List<Chef> retrievedChefs = chefService.allChefs();

        // Then
        assertThat(retrievedChefs).isNotNull();
    }
    @Test
    void testNoArgsConstructor() {
        // Create an instance using the no-argument constructor
        ChefService chefService = new ChefService();

        // Assert that the instance is not null
        assertNotNull(chefService);
    }
}
package com.example.usermanagementservice.service;

import com.example.usermanagementservice.model.Account;
import com.example.usermanagementservice.model.User;
import com.example.usermanagementservice.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class AccountServiceTest {
    @Mock
    private AccountRepository accountRepository;
    private AccountService accountService;


    @BeforeEach
    void setUp(){

        accountService=new AccountService(accountRepository);
    }
    @Test

    void loadUserLogin() {
        // Given
        String login = "testLogin";
        Date startTime = new Date();
        User user =new User("firstName","lastName","email@email.com","065478");
        Account account = new Account(1L,"testLogin","password",startTime,user);
        when(accountRepository.findByLogin(login)).thenReturn(Optional.of(account));

        // When
        Optional<Account> loadedAccount = accountService.loadUserLogin(login);

        // Then
        assertThat(loadedAccount).isPresent();
        assertThat(loadedAccount.get()).isEqualTo(account);
    }

    @Test
    void loadUserLogin_AccountDoesNotExist() {
        // Given
        String login = "nonExistingLogin";
        when(accountRepository.findByLogin(login)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(UsernameNotFoundException.class, () -> accountService.loadUserLogin(login));
    }

    @Test
    void userDetailsService() {
        // Given
        String username = "testUsername";
        String login = "testLogin";
        Date startTime = new Date();
        User user =new User("testUsername","testUsername","email@email.com","065478");
        Account account = new Account(1L,"testUsername","password",startTime,user);


        when(accountRepository.findByLogin(username)).thenReturn(Optional.of(account));

        // When
        UserDetails userDetails = accountService.userDetailsService().loadUserByUsername(username);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(username);
    }

    @Test
    void save() {
        // Given
        Account accountToSave = new Account(/* Initialize with necessary parameters */);

        // When
        accountService.save(accountToSave);

        // Then
        ArgumentCaptor<Account> accountArgumentCaptor = ArgumentCaptor.forClass(Account.class);
        verify(accountRepository).save(accountArgumentCaptor.capture());
        assertThat(accountArgumentCaptor.getValue()).isEqualTo(accountToSave);
    }

    @Test
    void allAccounts() {
        // Given
        List<Account> accountList = new ArrayList<>();
        accountList.add(new Account(/* Initialize with necessary parameters */));
        accountList.add(new Account(/* Initialize with necessary parameters */));
        when(accountRepository.findAll()).thenReturn(accountList);

        // When
        List<Account> retrievedAccounts = accountService.allAccounts();

        // Then
        assertThat(retrievedAccounts).isNotNull();

    }

}
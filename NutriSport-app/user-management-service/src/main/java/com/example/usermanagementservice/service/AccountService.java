package com.example.usermanagementservice.service;

import com.example.usermanagementservice.model.Account;
import com.example.usermanagementservice.model.Sportif;
import com.example.usermanagementservice.repository.AccountRepository;
import com.example.usermanagementservice.repository.SportifRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@AllArgsConstructor
public class AccountService {

    @Autowired
    private AccountRepository accountRepo;



    public Optional<Account> loadUserLogin(String login) throws UsernameNotFoundException {
        Optional<Account> account = accountRepo.findByLogin(login);
        if (account.isEmpty()) {
            throw new UsernameNotFoundException("Account not found: " + login);
        }
        return account;}

    public UserDetailsService userDetailsService() {
        return username -> accountRepo.findByLogin(username)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found: " + username));
    }

    public Account save(Account account) {
        return accountRepo.save(account);
    }
    public List<Account> allAccounts(){
        List<Account> accounts=new ArrayList<>();
        accounts=accountRepo.findAll();
        return accounts;
    }

}
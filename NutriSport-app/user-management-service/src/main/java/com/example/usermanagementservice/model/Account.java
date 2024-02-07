package com.example.usermanagementservice.model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;


import java.io.Serializable;
import java.util.*;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "accounts")
public class Account  implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String login;
    private String password;
    private Date creationDate;

    @OneToOne()
    @JoinColumn(name = "user_id", unique = true)
    private User user;
//    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
//    @JsonBackReference
//    private List<Session> sessions;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return defineAuthorities();
    }


    @Override
    public String getUsername() {
        return login;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    private List<GrantedAuthority> defineAuthorities(){
        List<GrantedAuthority> authorities = new ArrayList<>();


// Additional authorities for Sportif
        if (user instanceof Sportif) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SPORTIF"));
        }

// Additional authorities for Chef
        if (user instanceof Chef) {
            authorities.add(new SimpleGrantedAuthority("ROLE_CHEF"));
        }

        return authorities;

    }
}

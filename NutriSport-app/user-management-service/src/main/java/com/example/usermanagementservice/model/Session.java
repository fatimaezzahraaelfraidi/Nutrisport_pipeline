package com.example.usermanagementservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;
@Entity
@Data
@Table(name = "sessions")
@AllArgsConstructor
@NoArgsConstructor
public class Session{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date startTime;
    private Date endTime;
    private String token;
    private Boolean isAuthenticated;
    private String fcmToken;
    @ManyToOne
    @JoinColumn(name = "account_id")
//    @JsonManagedReference
    private Account account;


    @OneToOne
    @JoinColumn(name = "location_id")
    @JsonIgnoreProperties
    private Location location;





}

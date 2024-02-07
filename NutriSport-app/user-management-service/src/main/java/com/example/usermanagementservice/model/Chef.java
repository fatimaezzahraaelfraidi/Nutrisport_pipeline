package com.example.usermanagementservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
//@Table(name = "chefs")
public class Chef extends User {

    private Double rank;
    private String cinNumber;
    public Chef(String firstName,String lastName,String email, String phone,String cinNumber){
       super( firstName, lastName, email,  phone);
       this.cinNumber = cinNumber;
       this.rank=0.0;
    }
}

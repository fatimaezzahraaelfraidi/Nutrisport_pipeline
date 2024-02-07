package com.example.usermanagementservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Data
@NoArgsConstructor@AllArgsConstructor
public class Sportif extends  User  {

    private Double weight;
    private String allergies;
    public Sportif(String firtName,String lastName,String email, String phone){
        super( firtName, lastName, email,  phone);
        this.allergies="";

    }


}

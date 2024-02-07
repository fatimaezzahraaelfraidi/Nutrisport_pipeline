package com.example.usermanagementservice.dto;

import com.example.usermanagementservice.model.Chef;
import com.example.usermanagementservice.model.Sportif;
import com.example.usermanagementservice.model.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class SignUpRequest {

    User user;
    String email;
    String password;
    String role;
    String cinNumber;

}
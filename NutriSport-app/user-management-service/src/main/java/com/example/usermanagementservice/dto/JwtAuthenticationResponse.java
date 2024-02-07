package com.example.usermanagementservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthenticationResponse {
    private String token;
    private String sessionToken;
    private Long sessionId;
    private String userFullName;
    private String userMail;
    private String role;
    private String phone;
    public JwtAuthenticationResponse(String token) {
        this.token=token;
    }
}

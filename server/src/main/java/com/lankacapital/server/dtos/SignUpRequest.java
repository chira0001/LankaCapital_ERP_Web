package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class SignUpRequest {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String password;
}

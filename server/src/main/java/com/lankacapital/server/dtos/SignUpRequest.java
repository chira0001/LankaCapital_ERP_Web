package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class SignUpRequest {
    private String nic;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String password;
}

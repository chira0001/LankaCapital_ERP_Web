package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class SignInRequest {
    private String username;
    private String password;
}

package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class PasswordRequestDto {
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}

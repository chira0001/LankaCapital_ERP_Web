package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class EmployeeProfileDto {

    private Long id;

    private String firstName;
    private String lastName;
    private String email;

    private String phoneNumber;
    private String address;

    private String role;

    private String accountStatus;
}
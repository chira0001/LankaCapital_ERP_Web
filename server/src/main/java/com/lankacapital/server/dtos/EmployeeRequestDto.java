package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class EmployeeRequestDto {

    private Long nic;
    private String firstName;
    private String lastName;
    private String email;

    private Integer roleId;

    private String address;
    private String phoneNumber;
}
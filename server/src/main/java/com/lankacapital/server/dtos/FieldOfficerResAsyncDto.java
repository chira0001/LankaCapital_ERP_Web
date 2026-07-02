package com.lankacapital.server.dtos;

import lombok.Data;

@Data
public class FieldOfficerResAsyncDto {
    private Long id;
    private Long nic;
    private String first_name;
    private String last_name;
    private String email;
    private String address;
    private String phone_number;
}

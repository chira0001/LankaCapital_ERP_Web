package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class EmployeeAddDto {

    private Long nic;
    private String firstName;
    private String lastName;
    private String email;
    private Integer roleId;
    private String address;
    private String phoneNumber;
    private BigDecimal basicSalary;

}

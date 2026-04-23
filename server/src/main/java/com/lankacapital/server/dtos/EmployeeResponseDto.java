package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Role;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EmployeeResponseDto {
    private Long id;
    private Long nic;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private String address;
    private String phoneNumber;
    private BigDecimal basicSalary;
}

package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Role;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class EmployeeResponseDto {
    private Long id;
    private String nic;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String address;
    private String phoneNumber;
    private BigDecimal basicSalary;
    private String accountStatus;
    private List<String> menuPermissions;
}

package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Role;
import com.lankacapital.server.enums.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class CustomerResponseDto {
    private String nic;
    private String name;
    private String email;
    private String address;
    private Role role;
    private String phoneNumber;
    private String bank;
    private String bankAccount;
    private List<LoanResponseDto> loans;
}

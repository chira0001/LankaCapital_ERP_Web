package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Loan;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@AllArgsConstructor
@Data
public class CustomerResponseDto {
    private long nic;
    private String name;
    private String email;
    private String address;
    private String role;
    private String phoneNumber;
    private List<Loan> loans;
}

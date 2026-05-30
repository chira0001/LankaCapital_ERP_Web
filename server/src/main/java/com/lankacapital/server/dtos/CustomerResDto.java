package com.lankacapital.server.dtos;

import lombok.Data;

import java.util.List;

@Data
public class CustomerResDto {
    private String name;
    private String address;
    private String email;
    private String phoneNumber;
    private List<LoanResDto> loans;
}

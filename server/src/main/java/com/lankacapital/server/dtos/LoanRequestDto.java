package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanRequestDto {
    private BigDecimal loanAmount;
    private Integer installments;
    private Long employeeId;
    private String customerId;

    private String name;
    private String email;
    private String address;
    private String phoneNumber;
}

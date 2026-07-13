package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomerAddDto {
    private String customerId;
    private String name;
    private String email;
    private String address;
    private String phoneNumber;

    private BigDecimal loanAmount;
    private Integer installmentId;
    private Long employeeId;
}

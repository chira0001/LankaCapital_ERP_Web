package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class LoanCreateDto {
    private String fileNumber;
    private BigDecimal loanAmount;
    private Integer interestRate;
    private BigDecimal documentCharge;
    private Double numberOfInstallments;
    private Long employeeId;

    private Long customerId;

    private String name;
    private String email;
    private String address;
    private String phoneNumber;
}

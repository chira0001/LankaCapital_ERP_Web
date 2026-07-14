package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class LoanCreateDto {
    private String fileNumber;
    private BigDecimal loanAmount;
    private Double interestRate;
    private BigDecimal documentCharge;
    private Integer numberOfInstallments;

    private String customerId;

    private String name;
    private String email;
    private String address;
    private String phoneNumber;
    private String bank;
    private String bankAccount;
}

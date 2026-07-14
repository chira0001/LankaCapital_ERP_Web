package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanUpdateDto {

    private BigDecimal amount;
    private String decisionNote;
    private BigDecimal documentCharge;
    private Double interestRate;
    private Integer installment;
    private String status;
}

package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyIncomeDto {

    private String month;

    // total income for the month (SUM of all sources)
    private BigDecimal income;

    // optional breakdown (can be null if not needed)
    private BigDecimal loanInterest;
    private BigDecimal registrationFees;
    private BigDecimal otherIncome;
}
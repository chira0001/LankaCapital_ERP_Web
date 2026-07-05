package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyExpenseDto {

    private String month;

    // TOTAL monthly expense (SUM of everything below)
    private BigDecimal totalExpense;

    private BigDecimal salary;
    private BigDecimal vehicleAndTravel;
    private BigDecimal fuel;
    private BigDecimal rent;
    private BigDecimal telephone;
    private BigDecimal electricity;
    private BigDecimal router;
    private BigDecimal otherExpenses;
}
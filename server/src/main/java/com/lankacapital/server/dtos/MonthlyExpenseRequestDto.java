package com.lankacapital.server.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MonthlyExpenseRequestDto {

    @NotNull
    @PositiveOrZero
    private BigDecimal buildingRent;

    @NotNull
    @PositiveOrZero
    private BigDecimal electricityBill;

    @PositiveOrZero
    private BigDecimal fuelAllowance;

    @Size(max = 255)
    private String note;

    @PositiveOrZero
    private BigDecimal otherExpenses;

    @PositiveOrZero
    private BigDecimal routerBill;

    @PositiveOrZero
    private BigDecimal telephoneBill;

    @PositiveOrZero
    private BigDecimal vehicleAllowanceAndTravel;

    @NotNull
    private Long employeeId;
}
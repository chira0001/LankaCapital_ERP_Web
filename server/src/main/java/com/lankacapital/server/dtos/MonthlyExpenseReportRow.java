package com.lankacapital.server.dtos;

import com.lankacapital.server.enums.Request;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyExpenseReportRow {
    private String month;
    private String employeeName;
    private BigDecimal salary;
    private BigDecimal vehicleAllowanceAndTravel;
    private BigDecimal fuelAllowance;
    private BigDecimal buildingRent;
    private BigDecimal telephoneBill;
    private BigDecimal electricityBill;
    private BigDecimal routerBill;
    private BigDecimal otherExpenses;
    private String note;
    private BigDecimal totalExpenses;
    private Request request;
}

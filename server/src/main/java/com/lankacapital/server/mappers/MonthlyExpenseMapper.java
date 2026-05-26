package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.MonthlyExpenseRequestDto;
import com.lankacapital.server.entities.MonthlyExpense;

import java.math.BigDecimal;

public class MonthlyExpenseMapper {

    public static MonthlyExpense mapToMonthlyExpense(MonthlyExpenseRequestDto dto) {

        MonthlyExpense expense = new MonthlyExpense();

        expense.setBuildingRent(defaultValue(dto.getBuildingRent()));
        expense.setElectricityBill(defaultValue(dto.getElectricityBill()));
        expense.setFuelAllowance(defaultValue(dto.getFuelAllowance()));
        expense.setOtherExpenses(defaultValue(dto.getOtherExpenses()));
        expense.setRouterBill(defaultValue(dto.getRouterBill()));
        expense.setTelephoneBill(defaultValue(dto.getTelephoneBill()));
        expense.setVehicleAllowanceAndTravel(defaultValue(dto.getVehicleAllowanceAndTravel()));
        expense.setNote(dto.getNote());

        return expense;
    }

    private static BigDecimal defaultValue(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
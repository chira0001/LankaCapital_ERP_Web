package com.lankacapital.server.services;

import com.lankacapital.server.dtos.MonthlyExpenseReportRow;
import com.lankacapital.server.dtos.MonthlyExpenseRequestDto;

import java.util.Optional;

public interface MonthlyExpenseService {
    String addMonthlyExpenses(MonthlyExpenseRequestDto monthlyExpenseRequestDto, String username);
    Optional<MonthlyExpenseReportRow> getMonthlyExpenseReport(String month);
}

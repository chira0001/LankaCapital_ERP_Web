package com.lankacapital.server.services;

import com.lankacapital.server.dtos.MonthlyExpenseRequestDto;

public interface MonthlyExpenseService {
    String addMonthlyExpenses(MonthlyExpenseRequestDto monthlyExpenseRequestDto, String username);
}

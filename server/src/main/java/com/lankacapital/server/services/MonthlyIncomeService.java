package com.lankacapital.server.services;

import com.lankacapital.server.dtos.MonthlyIncomeRequestDto;
import com.lankacapital.server.entities.MonthlyIncome;

import java.math.BigDecimal;
import java.util.Optional;

public interface MonthlyIncomeService {

    String addMonthlyIncome(MonthlyIncomeRequestDto dto, String username);

    // =========================
    // SAVE INCOME
    // =========================
    MonthlyIncome save(MonthlyIncome income);

    Optional<MonthlyIncome> getMonthlyIncome(String month);

    // =========================
    // TOTAL INCOME (SAFE FOR FINANCIAL STATEMENT)
    // =========================
    BigDecimal getTotalIncomeByMonth(String month);
}
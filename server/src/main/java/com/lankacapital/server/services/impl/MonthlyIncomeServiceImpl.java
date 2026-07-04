package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.MonthlyIncomeRequestDto;
import com.lankacapital.server.entities.MonthlyIncome;
import com.lankacapital.server.repositories.MonthlyIncomeRepository;
import com.lankacapital.server.services.MonthlyIncomeService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@AllArgsConstructor
public class MonthlyIncomeServiceImpl implements MonthlyIncomeService {

    private final MonthlyIncomeRepository monthlyIncomeRepository;

    @Override
    public String addMonthlyIncome(MonthlyIncomeRequestDto dto, String username) {
        return "";
    }

    // =========================
    // SAVE INCOME
    // =========================
    @Override
    public MonthlyIncome save(MonthlyIncome income) {
        return monthlyIncomeRepository.save(income);
    }

    // =========================
    // GET MONTHLY INCOME (SAFE OPTIONAL)
    // =========================
    @Override
    public Optional<MonthlyIncome> getMonthlyIncome(String month) {

        LocalDate date = LocalDate.parse(month + "-01");

        return monthlyIncomeRepository.findByMonth(month);
    }

    // =========================
    // TOTAL INCOME (SAFE FOR FINANCIAL STATEMENT)
    // =========================
    @Override
    public BigDecimal getTotalIncomeByMonth(String month) {

        LocalDate date = LocalDate.parse(month + "-01");

        return monthlyIncomeRepository.findByMonth(month)
                .map(MonthlyIncome::getTotalIncome)
                .orElse(BigDecimal.ZERO);
    }
}
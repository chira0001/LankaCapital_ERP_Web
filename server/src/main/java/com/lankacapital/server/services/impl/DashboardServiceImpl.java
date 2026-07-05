package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.FinancialDashboardDto;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final FinancialStatementRepository financialStatementRepository;
    private final MonthlyIncomeRepository monthlyIncomeRepository;
    private final MonthlyExpenseRepository monthlyExpenseRepository;
    private final LoanRepository loanRepository;

    @Override
    public FinancialDashboardDto getFinancialDashboard() {

        FinancialDashboardDto dto = new FinancialDashboardDto();

        // 1. Income
        BigDecimal totalIncome = monthlyIncomeRepository.sumAllIncome();
        dto.setTotalIncome(totalIncome);

        // 2. Expense
        BigDecimal totalExpense = monthlyExpenseRepository.sumAllExpense();
        dto.setTotalExpense(totalExpense);

        // 3. Net Profit
        dto.setNetProfit(totalIncome.subtract(totalExpense));

        // 4. Assets (example: total loan portfolio)
        BigDecimal totalAssets = loanRepository.sumTotalLoanAmount();
        dto.setTotalAssets(totalAssets);

        // 5. Liabilities (example: unpaid obligations)
        BigDecimal totalLiabilities = loanRepository.sumOutstandingAmount();
        dto.setTotalLiabilities(totalLiabilities);

        // 6. Net Worth
        dto.setNetWorth(totalAssets.subtract(totalLiabilities));

        return dto;
    }
}
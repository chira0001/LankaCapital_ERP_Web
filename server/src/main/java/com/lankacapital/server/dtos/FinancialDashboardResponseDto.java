package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FinancialDashboardResponseDto {


    private double totalIncome;
    private double totalExpense;
    private double netProfit;
    private double totalAssets;
    private double totalLiabilities;
    private double netWorth;

    private long totalActiveLoans;
    private double totalOutstanding;
    private double monthlyCollection;
    private double monthlyProfit;


    // CHART DATA

    private List<MonthlyIncomeRequestDto> monthlyIncome;
    private List<MonthlyExpenseReportRow> monthlyExpense;

    private List<LoanDistributionDto> loanDistribution;
      private List<AlertDto> alerts;
}
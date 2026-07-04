package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class FinancialDashboardDto {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netProfit;

    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal netWorth;
}
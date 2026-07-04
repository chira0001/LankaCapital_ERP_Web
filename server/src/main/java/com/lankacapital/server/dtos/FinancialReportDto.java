package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReportDto {

    private String period;

    // P&L
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netProfit;

    // Balance Sheet
    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal equity;

    // Cash Flow
    private BigDecimal cashIn;
    private BigDecimal cashOut;
    private BigDecimal netCashFlow;
}
package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class ProfitLossDto {

    private String period;

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netProfit;
    private BigDecimal profitMargin;
}
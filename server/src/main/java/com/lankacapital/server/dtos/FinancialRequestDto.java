package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FinancialRequestDto {
    private BigDecimal landBuilding;
    private BigDecimal equipment;
    private BigDecimal furniture;
    private BigDecimal vehicles;
    private BigDecimal accumulatedDepreciation;
    private BigDecimal directorCurrentAccount;
    private BigDecimal otherLiabilities;
    private BigDecimal tradePayables;
    private BigDecimal inventory;
    private BigDecimal prepaidExpenses;
    private BigDecimal bankLoan;
    private String notes;
}

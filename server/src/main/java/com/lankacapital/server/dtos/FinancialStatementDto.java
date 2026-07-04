package com.lankacapital.server.dtos;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialStatementDto {

    private Long id;

    private LocalDate reportDate;

    // Assets
    private BigDecimal receivables;
    private BigDecimal cashAndCashEquivalent;
    private BigDecimal inventory;
    private BigDecimal prepaidExpenses;
    private BigDecimal landBuilding;
    private BigDecimal vehicles;
    private BigDecimal furniture;
    private BigDecimal equipment;
    private BigDecimal accumulatedDepreciation;

    // Liabilities
    private BigDecimal tradePayables;
    private BigDecimal directorCurrentAccount;
    private BigDecimal bankLoan;
    private BigDecimal otherLiabilities;

    // Equity
    private BigDecimal capital;
    private BigDecimal retainedEarnings;

    private String notes;

    //totals
//    private BigDecimal totalAssets;
//    private BigDecimal totalLiabilities;
//    private BigDecimal netWorth;
}
package com.lankacapital.server.entities;

import jakarta.persistence.*;
        import lombok.*;

        import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_statement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialStatement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_date", unique=true )
    private LocalDate reportDate;

    // =========================
    // ASSETS
    // =========================

    @Column(precision = 14, scale = 2)
    private BigDecimal receivables = BigDecimal.ZERO;

    @Column(name = "cash_and_cash_equivalent", precision = 14, scale = 2)
    private BigDecimal cashAndCashEquivalent = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal inventory = BigDecimal.ZERO;

    @Column(name = "prepaid_expenses", precision = 14, scale = 2)
    private BigDecimal prepaidExpenses = BigDecimal.ZERO;

    @Column(name = "land_building", precision = 14, scale = 2)
    private BigDecimal landBuilding = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal vehicles = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal furniture = BigDecimal.ZERO;

    @Column(precision = 14, scale = 2)
    private BigDecimal equipment = BigDecimal.ZERO;

    @Column(name = "accumulated_depreciation", precision = 14, scale = 2)
    private BigDecimal accumulatedDepreciation = BigDecimal.ZERO;

    // =========================
    // LIABILITIES
    // =========================

    @Column(name = "trade_payables", precision = 14, scale = 2)
    private BigDecimal tradePayables = BigDecimal.ZERO;

    @Column(name = "director_current_account", precision = 14, scale = 2)
    private BigDecimal directorCurrentAccount = BigDecimal.ZERO;

    @Column(name = "bank_loan", precision = 14, scale = 2)
    private BigDecimal bankLoan = BigDecimal.ZERO;

    @Column(name = "other_liabilities", precision = 14, scale = 2)
    private BigDecimal otherLiabilities = BigDecimal.ZERO;

    // =========================
    // EQUITY
    // =========================

    @Column(precision = 14, scale = 2)
    private BigDecimal capital = BigDecimal.ZERO;

    @Column(name = "retained_earnings", precision = 14, scale = 2)
    private BigDecimal retainedEarnings = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal netWorth;
}
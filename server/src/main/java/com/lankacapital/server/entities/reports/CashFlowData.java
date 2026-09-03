package com.lankacapital.server.entities.reports;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cashFlowData")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CashFlowData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private LocalDate financialDate;
    private BigDecimal incomeTaxPaidAmount;
    private BigDecimal cashInHandAmount;
    private BigDecimal openingCashBalance;
}

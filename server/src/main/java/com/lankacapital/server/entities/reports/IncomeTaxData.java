package com.lankacapital.server.entities.reports;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "incomeTax")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class IncomeTaxData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate financialDate;
    private BigDecimal withholdingAmount;
    private LocalDate balanceBFDate;
    private BigDecimal balanceBFAmount;
    private BigDecimal investmentIncome;
    private BigDecimal businessIncome;
}

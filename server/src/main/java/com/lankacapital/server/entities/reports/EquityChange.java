package com.lankacapital.server.entities.reports;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "equityChange")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class EquityChange {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private LocalDate financialDate;
    private String dataName;
    private BigDecimal statedCapitalAmount;
    private BigDecimal retainedEarningAmount;
}

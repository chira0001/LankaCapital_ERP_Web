package com.lankacapital.server.entities.reports;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "financialNoteData")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class FinancialNoteData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate financialDate;
    private LocalDate balanceAtDate;
    private BigDecimal openingBalance;
    private BigDecimal depreciationBalance;

    @ManyToOne
    @JoinColumn(name = "asset")
    private AssetsRegistry assetsRegistry;
}

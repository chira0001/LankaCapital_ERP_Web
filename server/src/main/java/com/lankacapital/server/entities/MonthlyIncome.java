package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "monthly_income")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyIncome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String month; // e.g. "2026-05"

    private BigDecimal totalIncome;
    private BigDecimal loanInterest;
    private BigDecimal registrationFees;
    private BigDecimal otherIncome;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private Long updateStatus = 0L;
}
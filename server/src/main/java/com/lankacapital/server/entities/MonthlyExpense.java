package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "monthly_expenses")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MonthlyExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate timePeriod;

    @Column(precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(precision = 12, scale = 2)
    private BigDecimal vehicleAllowanceAndTravel;

    @Column(precision = 12, scale = 2)
    private BigDecimal fuelAllowance;

    @Column(precision = 12, scale = 2)
    private BigDecimal buildingRent;

    @Column(precision = 12, scale = 2)
    private BigDecimal telephoneBill;

    @Column(precision = 12, scale = 2)
    private BigDecimal electricityBill;

    @Column(precision = 12, scale = 2)
    private BigDecimal routerBill;

    @Column(precision = 12, scale = 2)
    private BigDecimal otherExpenses;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalExpenses;

    private String note;

    @PrePersist
    @PreUpdate
    public void calculateTotal() {
        this.totalExpenses =
                safe(salary)
                        .add(safe(vehicleAllowanceAndTravel))
                        .add(safe(fuelAllowance))
                        .add(safe(buildingRent))
                        .add(safe(telephoneBill))
                        .add(safe(electricityBill))
                        .add(safe(routerBill))
                        .add(safe(otherExpenses));
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
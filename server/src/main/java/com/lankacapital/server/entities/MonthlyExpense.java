package com.lankacapital.server.entities;

import com.lankacapital.server.enums.Request;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "monthly_expenses")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class MonthlyExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String month;

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

    private String note;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalExpenses;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private Request request = Request.PENDING;

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
package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "salaries")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate month;

    @OneToOne
    @JoinColumn(name = "employee_id")
    private Employee employeeId;

    private Integer workingDays;

    @Column(precision = 12, scale = 2)
    private BigDecimal incentive;

    @Column(precision = 12, scale = 2)
    private BigDecimal sales;

    @Column(precision = 12, scale = 2)
    private BigDecimal attendance;

    private Double otHours;

    @Column(precision = 12, scale = 2)
    private BigDecimal PayPerOtHour;

    @Column(precision = 12, scale = 2)
    private BigDecimal grossSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal unpaidLeave;

    @Column(precision = 12, scale = 2)
    private BigDecimal loan;

    @Column(precision = 12, scale = 2)
    private BigDecimal salaryAdvance;

    @Column(precision = 12, scale = 2)
    private BigDecimal employeeEPF;

    @Column(precision = 12, scale = 2)
    private BigDecimal companyEPF;

    @Column(precision = 12, scale = 2)
    private BigDecimal companyETF;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalSalary;

    @Column(precision = 12, scale = 2)
    private BigDecimal totalDeduction;

    @Column(precision = 12, scale = 2)
    private BigDecimal netSalary;

}

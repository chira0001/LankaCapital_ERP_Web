package com.lankacapital.server.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private Double incentive;
    private Double sales;
    private Double attendance;

    private Double otHours;
    private Double PayPerOtHour;

    private Double grossSalary;

    private Double unpaidLeave;
    private Double loan;
    private Double salaryAdvance;

    private Double employeeEPF;
    private Double companyEPF;
    private Double companyETF;

    private Double totalSalary;
    private Double totalDeduction;

    private Double netSalary;

}

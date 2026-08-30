package com.lankacapital.server.dtos.AdminDto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalaryResponseDto {
    private String name;
    private String nic;
    private BigDecimal basicSalary;
    private Integer workingDays;
    private BigDecimal incentives;
    private BigDecimal sales;
    private BigDecimal attendance;
    private Double hours;
    private BigDecimal pay;
    private BigDecimal travelFuel;
    private BigDecimal grossSalary;
    private BigDecimal unpaidLeaves;
    private BigDecimal salaryAdvance;
    private BigDecimal employeeEPF;
    private BigDecimal companyEPF;
    private BigDecimal companyETF;
    private BigDecimal totalSalary;
    private BigDecimal totalDeduction;
    private BigDecimal netSalary;
    private String status;
    private String enteredEmployeeName;
    private String enteredEmployeeNIC;
    private String approvedEmployeeName;
    private String approvedEmployeeNIC;
}

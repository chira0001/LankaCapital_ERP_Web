package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeSalaryAddDto {
    private Long employeeId;
    private Integer workingDays;
    private Double otHours;
    private Double unpaidLeaves;
    private Double loans;
    private Double salaryAdvance;
}

package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.EmployeeSalaryAddDto;
import com.lankacapital.server.entities.Salary;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;

public class SalaryMapper {

    public static Salary mapToSalary(EmployeeSalaryAddDto salaryAddDto){
        Salary salary = new Salary();
        salary.setMonth(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        salary.setWorkingDays(salaryAddDto.getWorkingDays());

        salary.setOtHours(salaryAddDto.getOtHours());
        salary.setUnpaidLeave(BigDecimal.valueOf(salaryAddDto.getUnpaidLeaves()));
        salary.setLoans(BigDecimal.valueOf(salaryAddDto.getLoans()));
        salary.setSalaryAdvance(BigDecimal.valueOf(salaryAddDto.getSalaryAdvance()));

        return salary;
    }
}

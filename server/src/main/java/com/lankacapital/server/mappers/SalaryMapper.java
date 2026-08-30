package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.AdminDto.SalaryResponseDto;
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
        salary.setTravel(BigDecimal.valueOf(salaryAddDto.getTravel()));
        salary.setSalaryAdvance(BigDecimal.valueOf(salaryAddDto.getSalaryAdvance()));

        return salary;
    }
    public static SalaryResponseDto mapToSalaryResponseDto(Salary salary){
        SalaryResponseDto dto = new SalaryResponseDto();

        dto.setName(salary.getEmployee() == null ? "" : salary.getEmployee().getFirstName() + " " + salary.getEmployee().getLastName());
        dto.setNic(salary.getEmployee() == null ? "" : salary.getEmployee().getNic());
        dto.setBasicSalary(salary.getEmployee() == null ? BigDecimal.ZERO : salary.getEmployee().getBasicSalary());
        dto.setWorkingDays(salary.getWorkingDays());
        dto.setIncentives(salary.getIncentive());
        dto.setSales(salary.getSales());
        dto.setAttendance(salary.getAttendance());
        dto.setHours(salary.getOtHours());
        dto.setPay(salary.getOtAmount());
        dto.setTravelFuel(salary.getTravel());
        dto.setGrossSalary(salary.getGrossSalary());
        dto.setUnpaidLeaves(salary.getUnpaidLeave());
        dto.setSalaryAdvance(salary.getSalaryAdvance());
        dto.setEmployeeEPF(salary.getEmployeeEPF());
        dto.setCompanyEPF(salary.getCompanyEPF());
        dto.setCompanyETF(salary.getCompanyETF());
        dto.setTotalSalary(salary.getTotalSalary());
        dto.setTotalDeduction(salary.getTotalDeduction());
        dto.setNetSalary(salary.getNetSalary());
        dto.setStatus(salary.getStatus().name());
        dto.setEnteredEmployeeName(salary.getEnteredEmployee() == null ? "" : salary.getEnteredEmployee().getFirstName() + " " + salary.getEnteredEmployee().getLastName());
        dto.setEnteredEmployeeNIC(salary.getEnteredEmployee() == null ? "" : salary.getEnteredEmployee().getNic());
        dto.setApprovedEmployeeName(salary.getApprovedEmployee() == null ? "" : salary.getApprovedEmployee().getFirstName() + " " + salary.getApprovedEmployee().getLastName());
        dto.setApprovedEmployeeNIC(salary.getApprovedEmployee() == null ? "" : salary.getApprovedEmployee().getNic());

        return dto;
    }
}

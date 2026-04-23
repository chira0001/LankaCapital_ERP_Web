package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.EmployeeSalaryAddDto;
import com.lankacapital.server.entities.*;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.SalaryMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.SalaryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@AllArgsConstructor
public class SalaryServiceImpl implements SalaryService {
    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryMetaDataRepository salaryMetaDataRepository;
    private final SalaryConditionRepository salaryConditionRepository;
    private final RoleRepository roleRepository;

    @Override
    public void addSalaryToEmployee(EmployeeSalaryAddDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + dto.getEmployeeId()));

        Salary newSalary = SalaryMapper.mapToSalary(dto);
        newSalary.setEmployeeId(employee);

        Role role = roleRepository.findByRoleName(employee.getRole().getRoleName());

        SalaryCondition incentives = salaryConditionRepository.findByConditionName("IncentiveRate");
        SalaryMetaData incentiveMetaData = salaryMetaDataRepository.findBySalaryConditionAndRole(incentives,role);

        SalaryCondition sales = salaryConditionRepository.findByConditionName("SalesRate");
        SalaryMetaData salesMetaData = salaryMetaDataRepository.findBySalaryConditionAndRole(sales,role);

        SalaryCondition attendance = salaryConditionRepository.findByConditionName("AttendanceAmount");
        SalaryMetaData attendanceMetaData = salaryMetaDataRepository.findBySalaryConditionAndRole(attendance,role);

        SalaryCondition otHours = salaryConditionRepository.findByConditionName("PayPerOtHour");
        SalaryMetaData otHoursMetaData = salaryMetaDataRepository.findBySalaryConditionAndRole(otHours,role);

        SalaryCondition employeeEPF = salaryConditionRepository.findByConditionName("EmployeeEPF");
        SalaryMetaData employeeEPFMetaData = salaryMetaDataRepository.findBySalaryConditionAndRole(employeeEPF,role);

        SalaryCondition companyEPF = salaryConditionRepository.findByConditionName("CompanyEPF");
        SalaryMetaData companyEPFMetaData = salaryMetaDataRepository.findBySalaryConditionAndRole(companyEPF,role);

        SalaryCondition companyETF = salaryConditionRepository.findByConditionName("CompanyETF");
        SalaryMetaData companyETFMetaData = salaryMetaDataRepository.findBySalaryConditionAndRole(companyETF,role);

        BigDecimal incentiveVal = employee.getBasicSalary()
                .multiply(BigDecimal.valueOf(incentiveMetaData.getValue()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        newSalary.setIncentive(incentiveVal);

        BigDecimal salesVal = employee.getBasicSalary()
                .multiply(BigDecimal.valueOf(salesMetaData.getValue()))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        newSalary.setSales(salesVal);

        BigDecimal attendanceVal = BigDecimal.valueOf(dto.getWorkingDays())
                .multiply(BigDecimal.valueOf(attendanceMetaData.getValue()));
        newSalary.setAttendance(attendanceVal);

        BigDecimal otAmountVal = BigDecimal.valueOf(dto.getOtHours())
                .multiply(BigDecimal.valueOf(otHoursMetaData.getValue()));
        newSalary.setOtAmount(otAmountVal);

        BigDecimal grossSalaryVal = employee.getBasicSalary()
                .add(incentiveVal)
                .add(salesVal)
                .add(attendanceVal)
                .add(otAmountVal);
        newSalary.setGrossSalary(grossSalaryVal);

        BigDecimal employeeEPFVal = employee.getBasicSalary()
                .multiply(BigDecimal.valueOf(employeeEPFMetaData.getValue())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        newSalary.setEmployeeEPF(employeeEPFVal);

        BigDecimal companyEPFVal = employee.getBasicSalary()
                .multiply(BigDecimal.valueOf(companyEPFMetaData.getValue())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        newSalary.setCompanyEPF(companyEPFVal);

        BigDecimal companyETFVal = employee.getBasicSalary()
                .multiply(BigDecimal.valueOf(companyETFMetaData.getValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        newSalary.setCompanyETF(companyETFVal);

        BigDecimal totalDeductionVal = BigDecimal.valueOf(dto.getUnpaidLeaves())
                .add(BigDecimal.valueOf(dto.getLoans()))
                .add(BigDecimal.valueOf(dto.getSalaryAdvance()))
                .add(employeeEPFVal);
        newSalary.setTotalDeduction(totalDeductionVal);

        BigDecimal netSalaryVal = grossSalaryVal.subtract(totalDeductionVal);
        newSalary.setNetSalary(netSalaryVal);

        newSalary.setTotalSalary(totalDeductionVal.add(netSalaryVal).add(companyEPFVal).add(companyETFVal));

        System.out.println(newSalary);
    }
}

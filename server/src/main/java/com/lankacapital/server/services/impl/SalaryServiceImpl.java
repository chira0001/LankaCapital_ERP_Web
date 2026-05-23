package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.EmployeeSalaryAddDto;
import com.lankacapital.server.entities.*;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.SalaryMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.SalaryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class SalaryServiceImpl implements SalaryService {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryMetaDataRepository salaryMetaDataRepository;
    private final SalaryConditionRepository salaryConditionRepository;
    private final RoleRepository roleRepository;

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final int SCALE = 2;

    @Override
    public void addSalaryToEmployee(List<EmployeeSalaryAddDto> dtoList) {

        if (dtoList == null || dtoList.isEmpty()) {
            throw new IllegalArgumentException("Salary DTO list cannot be null or empty");
        }

        String currentMonth = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM"));

        List<Salary> salaries = new ArrayList<>();

        for (EmployeeSalaryAddDto dto : dtoList) {

            validateDto(dto);

            Employee employee = getEmployee(dto.getEmployeeId());
            Role role = getRole(employee);

            if (salaryRepository.existsByEmployeeAndMonth(employee, currentMonth)) {
                throw new ResourceExistException(
                        "Salary already exists for month " + currentMonth
                );
            }

            Salary salary = SalaryMapper.mapToSalary(dto);
            salary.setEmployee(employee);
            salary.setMonth(currentMonth);

            SalaryMetaData incentiveMeta = getMeta("IncentiveRate", role);
            SalaryMetaData salesMeta = getMeta("SalesRate", role);
            SalaryMetaData attendanceMeta = getMeta("AttendanceAmount", role);
            SalaryMetaData otMeta = getMeta("PayPerOtHour", role);
            SalaryMetaData employeeEPFMeta = getMeta("EmployeeEPF", role);
            SalaryMetaData companyEPFMeta = getMeta("CompanyEPF", role);
            SalaryMetaData companyETFMeta = getMeta("CompanyETF", role);

            BigDecimal basic = safe(employee.getBasicSalary());

            BigDecimal incentive = percentage(basic, incentiveMeta.getValue());
            BigDecimal sales = percentage(basic, salesMeta.getValue());
            BigDecimal attendance = multiply(dto.getWorkingDays(), attendanceMeta.getValue());
            BigDecimal otAmount = multiply(dto.getOtHours(), otMeta.getValue());

            BigDecimal gross = sum(basic, incentive, sales, attendance, otAmount);

            BigDecimal employeeEPF = percentage(basic, employeeEPFMeta.getValue());
            BigDecimal companyEPF = percentage(basic, companyEPFMeta.getValue());
            BigDecimal companyETF = percentage(basic, companyETFMeta.getValue());

            BigDecimal unpaidLeave = toBigDecimal(dto.getUnpaidLeaves());
            BigDecimal loans = toBigDecimal(dto.getLoans());
            BigDecimal advance = toBigDecimal(dto.getSalaryAdvance());

            BigDecimal totalDeduction = sum(unpaidLeave, loans, advance, employeeEPF);

            BigDecimal net = gross.subtract(totalDeduction)
                    .setScale(SCALE, RoundingMode.HALF_UP);

            BigDecimal totalSalary = sum(net, totalDeduction, companyEPF, companyETF);

            salary.setIncentive(incentive);
            salary.setSales(sales);
            salary.setAttendance(attendance);
            salary.setOtAmount(otAmount);
            salary.setGrossSalary(gross);

            salary.setUnpaidLeave(unpaidLeave);
            salary.setLoans(loans);
            salary.setSalaryAdvance(advance);

            salary.setEmployeeEPF(employeeEPF);
            salary.setCompanyEPF(companyEPF);
            salary.setCompanyETF(companyETF);

            salary.setTotalDeduction(totalDeduction);
            salary.setNetSalary(net);
            salary.setTotalSalary(totalSalary);

            salaries.add(salary);
        }
        salaryRepository.saveAll(salaries);
    }

    private void validateDto(EmployeeSalaryAddDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Salary DTO cannot be null");
        }
        if (dto.getEmployeeId() == null) {
            throw new IllegalArgumentException("Employee ID is required");
        }
    }

    private Employee getEmployee(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    private Role getRole(Employee employee) {
        if (employee.getRole() == null) {
            throw new IllegalStateException("Employee role is not assigned");
        }

        Role role = roleRepository.findByRoleName(employee.getRole().getRoleName());
        if (role == null) {
            throw new ResourceNotFoundException("Role not found: " + employee.getRole().getRoleName());
        }
        return role;
    }

    private SalaryMetaData getMeta(String conditionName, Role role) {
        SalaryCondition condition = salaryConditionRepository.findByConditionName(conditionName);

        if (condition == null) {
            throw new ResourceNotFoundException("Condition not found: " + conditionName);
        }

        SalaryMetaData meta = salaryMetaDataRepository.findBySalaryConditionAndRole(condition, role);

        if (meta == null) {
            throw new ResourceNotFoundException(
                    "Metadata not found for condition: " + conditionName + " and role: " + role.getRoleName()
            );
        }

        return meta;
    }

    private BigDecimal percentage(BigDecimal base, Double percent) {
        return safe(base)
                .multiply(BigDecimal.valueOf(percent))
                .divide(ONE_HUNDRED, SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal multiply(Number a, Double b) {
        return toBigDecimal(a)
                .multiply(BigDecimal.valueOf(b))
                .setScale(SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal sum(BigDecimal... values) {
        BigDecimal result = BigDecimal.ZERO;
        for (BigDecimal val : values) {
            result = result.add(safe(val));
        }
        return result.setScale(SCALE, RoundingMode.HALF_UP);
    }

    private BigDecimal safe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private BigDecimal toBigDecimal(Number value) {
        return value == null ? BigDecimal.ZERO : BigDecimal.valueOf(value.doubleValue());
    }
}
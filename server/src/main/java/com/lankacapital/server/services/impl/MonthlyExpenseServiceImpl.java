package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.MonthlyExpenseRequestDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.MonthlyExpense;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.MonthlyExpenseMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.MonthlyExpenseRepository;
import com.lankacapital.server.repositories.SalaryRepository;
import com.lankacapital.server.services.MonthlyExpenseService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@AllArgsConstructor
public class MonthlyExpenseServiceImpl implements MonthlyExpenseService {

    private MonthlyExpenseRepository monthlyExpenseRepository;
    private SalaryRepository salaryRepository;
    private EmployeeRepository employeeRepository;

    @Override
    @Transactional
    public String addMonthlyExpenses(MonthlyExpenseRequestDto dto) {

        MonthlyExpense monthlyExpense =
                MonthlyExpenseMapper.mapToMonthlyExpense(dto);

        String currentMonth = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM"));

        if(!monthlyExpenseRepository.existsByMonth(currentMonth)){
            BigDecimal totalSalary =
                    salaryRepository.getTotalSalaryByMonth(currentMonth);
            if (dto.getEmployeeId() == null){
                throw new ResourceNotFoundException("Employee id not provided");
            }
            Employee employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Employee not found with id: " + dto.getEmployeeId()));

            monthlyExpense.setSalary(totalSalary);
            monthlyExpense.setEmployee(employee);
            monthlyExpense.setMonth(currentMonth);

            monthlyExpenseRepository.save(monthlyExpense);

            return "Successfully added monthly expenses";
        }
        else {
            throw new ResourceExistException("Monthly expenses already exist for " + currentMonth);
        }
    }
}
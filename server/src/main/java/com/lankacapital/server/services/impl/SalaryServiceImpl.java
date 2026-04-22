package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.EmployeeSalaryAddDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Salary;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.SalaryMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.SalaryRepository;
import com.lankacapital.server.services.SalaryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SalaryServiceImpl implements SalaryService {
    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public void addSalaryToEmployee(EmployeeSalaryAddDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id " + dto.getEmployeeId()));

        Salary newSalary = SalaryMapper.mapToSalary(dto);
        newSalary.setEmployeeId(employee);



    }
}

package com.lankacapital.server.services;

import com.lankacapital.server.dtos.EmployeeAddDto;
import com.lankacapital.server.dtos.EmployeeResponseDto;
import com.lankacapital.server.entities.Employee;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface EmployeeService {

    UserDetailsService userDetailsService();

    Employee addNewEmployee(EmployeeAddDto dto);
    List<EmployeeResponseDto> getAllEmployees();

}

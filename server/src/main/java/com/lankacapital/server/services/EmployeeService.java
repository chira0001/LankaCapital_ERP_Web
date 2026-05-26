package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface EmployeeService {

    UserDetailsService userDetailsService();

    Employee addNewEmployee(EmployeeAddDto dto);
    List<EmployeeResponseDto> getAllEmployees();
    EmployeeResponseDto getEmployeeDetailById(Long id);
    String updatePasswordById(Long id, PasswordRequestDto dto);
    EmployeeResponseDto updateEmployeeInfo(Long id, EmployeeResponseDto dto);
    List<FieldOfficerResAsyncDto> findAllFieldOfficersById(FieldOfficerAsyncDto idList, int page);
}

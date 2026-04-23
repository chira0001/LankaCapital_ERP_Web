package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.EmployeeAddDto;
import com.lankacapital.server.dtos.EmployeeResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.EmployeeMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.RoleRepository;
import com.lankacapital.server.services.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

    @Override
    public UserDetailsService userDetailsService() {
        return new UserDetailsService() {
            @Override
            public UserDetails loadUserByUsername(String username) {
                return employeeRepository.findByEmail(username);
            }
        };
    }

    @Override
    public Employee addNewEmployee(EmployeeAddDto dto) {

        if (employeeRepository.existsByNic(dto.getNic())){
            throw new ResourceExistException("Employee already registered with id : " + dto.getNic());
        }

        Employee newEmployee = EmployeeMapper.mapToEmployee(dto);
        Role role = roleRepository.findById(dto.getRoleId())
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found with id " + dto.getRoleId()));

        newEmployee.setRole(role);
        return employeeRepository.save(newEmployee);
    }

    @Override
    public List<EmployeeResponseDto> getAllEmployees() {
        List<Employee> employeeList = employeeRepository.findAll();
        return employeeList.stream().map(EmployeeMapper::mapToEmployeeResponseDto).toList();
    }
}

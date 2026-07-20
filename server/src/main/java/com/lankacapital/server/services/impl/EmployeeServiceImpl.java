package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.dtos.EmployeeAddDto;
import com.lankacapital.server.dtos.EmployeeRequestDto;
import com.lankacapital.server.dtos.EmployeeResponseDto;
import com.lankacapital.server.dtos.PasswordRequestDto;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.exceptions.PasswordUpdateException;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.CustomerMapper;
import com.lankacapital.server.mappers.EmployeeMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.RoleRepository;
import com.lankacapital.server.services.EmployeeService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.authentication.PasswordEncoderParser;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetailsService userDetailsService() {

        return username -> {
            Employee employee = employeeRepository.findByEmail(username);

            if (employee == null) {
                throw new ResourceNotFoundException("User not found");
            }

            return new org.springframework.security.core.userdetails.User(
                    employee.getEmail(),
                    employee.getPassword(),
                    List.of(new SimpleGrantedAuthority(employee.getRole().getRoleName()))
            );
        };
    }

    @Override
    public Employee addNewEmployee(String username, EmployeeAddDto dto) {

        if (employeeRepository.existsByNic(dto.getNic())) {
            throw new ResourceExistException("Employee already registered with id : " + dto.getNic());
        }

        Employee newEmployee = EmployeeMapper.mapToEmployee(dto);

        Role role = roleRepository.findById(dto.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id " + dto.getRoleId()));

        newEmployee.setRole(role);
        newEmployee.setPassword(passwordEncoder.encode("1234567"));
        newEmployee.setCreatedEmployee(employeeRepository.findByEmail(username));

        return employeeRepository.save(newEmployee);
    }

    @Override
    @Transactional
    public List<EmployeeResponseDto> getAllEmployees(String username) {
        List<Employee> employeeList = employeeRepository.findAll();
        employeeList.remove(employeeRepository.findByEmail(username));
        return employeeList.stream().map(EmployeeMapper::mapToEmployeeResponseDto).toList();
    }

    @Override
    public List<EmployeeResponseDto> getAllEmployeesWithRole() {
        List<Employee> employeeList = employeeRepository.findByRoleIsNotNull();
        return employeeList.stream().map(EmployeeMapper::mapToEmployeeResponseDto).toList();
    }

    @Override
    public EmployeeResponseDto getEmployeeDetailByUsername(String username) {
        Employee emp = employeeRepository.findByEmail(username);
        if(emp == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }
        EmployeeResponseDto empDto = EmployeeMapper.mapToEmployeeResponseDto(emp);
        empDto.setBasicSalary(BigDecimal.valueOf(0));
        return empDto;
    }

    @Override
    public String updatePasswordByUsername(String username, PasswordRequestDto dto) {
        Employee emp = employeeRepository.findByEmail(username);
        if(emp == null){
            throw new ResourceNotFoundException("Employee verification not found");
        }
        if (!passwordEncoder.matches(dto.getOldPassword(), emp.getPassword())) {
            throw new PasswordUpdateException("Old password is incorrect");
        }
        try {
            emp.setPassword(passwordEncoder.encode(dto.getNewPassword()));
            employeeRepository.save(emp);
            return "Password changed successfully";
        } catch (Exception e) {
            throw new PasswordUpdateException("Failed to update password: " + e.getMessage());
        }
    }

    @Override
    public EmployeeResponseDto updateEmployeeInfo(String username, EmployeeResponseDto dto) {
        Employee emp = employeeRepository.findByEmail(username);
        Long status = emp.getUpdateStatus();
        if(emp == null){
            throw new ResourceNotFoundException("Employee verification not found");
        }
        emp.setNic(dto.getNic());
        emp.setFirstName(dto.getFirstName());
        emp.setLastName(dto.getLastName());
        emp.setEmail(dto.getEmail());
        emp.setAddress(dto.getAddress());
        emp.setPhoneNumber(dto.getPhoneNumber());
        emp.setUpdateStatus(status + 1);

        return EmployeeMapper.mapToEmployeeResponseDto(employeeRepository.save(emp));
    }

    @Override
    public List<FieldOfficerResAsyncDto> findAllFieldOfficersById(String username, FieldOfficerAsyncDto idList){
        Employee authEmployee = employeeRepository.findByEmail(username);
        if(authEmployee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }
        List<Employee> employees = employeeRepository.findCustomersByIds(idList.getId());

        return employees.stream()
                .map(EmployeeMapper::mapToEmployeeAsyncDto)
                .toList();
    }

    public EmployeeResponseDto updateEmployee(String username, Long id, EmployeeResponseDto dto) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));


        employee.setNic(dto.getNic());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setAddress(dto.getAddress());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setBasicSalary(dto.getBasicSalary());
        employee.setUpdateStatus(employee.getUpdateStatus() + 1);
        employee.setUpdatedEmployee(employeeRepository.findByEmail(username));
        if (dto.getRole() != null) {
            Role role = roleRepository.findByRoleName(dto.getRole());
            if (role != null) {
                employee.setRole(role);
            }
        }

        return EmployeeMapper.mapToEmployeeResponseDto(
                employeeRepository.save(employee)
        );
    }

    @Override
    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found"));

        employeeRepository.delete(employee);
    }

    @Override
    public List<EmployeeManageDto> manageEmployees(String username, int page) {
        Employee authEmployee = employeeRepository.findByEmail(username);
        if(authEmployee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }
        Pageable pageable = PageRequest.of(page, 50);

        return employeeRepository.findAllByRole(pageable)
                .getContent()
                .stream()
                .map(employee -> new EmployeeManageDto(
                        employee.getId(),
                        employee.getUpdateStatus()
                ))
                .toList();
    }
}

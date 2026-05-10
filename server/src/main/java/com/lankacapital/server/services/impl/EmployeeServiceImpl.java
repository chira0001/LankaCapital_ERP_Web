package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.EmployeeAddDto;
import com.lankacapital.server.dtos.EmployeeResponseDto;
import com.lankacapital.server.dtos.PasswordRequestDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.EmployeeMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.RoleRepository;
import com.lankacapital.server.services.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.authentication.PasswordEncoderParser;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@AllArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

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

    @Override
    public EmployeeResponseDto getEmployeeDetailById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        EmployeeResponseDto empDto = EmployeeMapper.mapToEmployeeResponseDto(emp);
        empDto.setBasicSalary(BigDecimal.valueOf(0));
        return empDto;
    }

    @Override
    public String updatePasswordById(Long id, PasswordRequestDto dto) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Manually verify old password using passwordEncoder
        if (!passwordEncoder.matches(dto.getOldPassword(), emp.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        try {
            emp.setPassword(passwordEncoder.encode(dto.getNewPassword()));
            employeeRepository.save(emp);
            return "Password changed successfully";
        } catch (Exception e) {
            throw new RuntimeException("Failed to update password: " + e.getMessage());
        }
    }

    @Override
    public EmployeeResponseDto updateEmployeeInfo(Long id, EmployeeResponseDto dto) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        emp.setId(dto.getId());
        emp.setNic(dto.getNic());
        emp.setFirstName(dto.getFirstName());
        emp.setLastName(dto.getLastName());
        emp.setEmail(dto.getEmail());
        emp.setAddress(dto.getAddress());
        emp.setPhoneNumber(dto.getPhoneNumber());

        return EmployeeMapper.mapToEmployeeResponseDto(employeeRepository.save(emp));
    }
}

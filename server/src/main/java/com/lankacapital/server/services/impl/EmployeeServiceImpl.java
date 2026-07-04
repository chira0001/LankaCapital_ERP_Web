package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.exceptions.PasswordUpdateException;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.EmployeeMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.RoleRepository;
import com.lankacapital.server.services.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.authentication.PasswordEncoderParser;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
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
//        return new UserDetailsService() {
//            @Override
//            public UserDetails loadUserByUsername(String username) {
//                return employeeRepository.findByEmail(username);
//            }
//        };

        /// /new
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
        emp.setId(dto.getId());
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
    public List<FieldOfficerResAsyncDto> findAllFieldOfficersById(FieldOfficerAsyncDto idList, int page){
        List<Long> allOfficerIds = employeeRepository.findAllFieldOfficersIds();
        if(allOfficerIds == null){
            throw new ResourceNotFoundException("FieldOfficer not found with NIC");
        }
        List<Long> notSyncedIds = new ArrayList<>();
        for (Long id : allOfficerIds) {
            if (!idList.getId().contains(id)) {
                notSyncedIds.add(id);
            }
        }
        if(notSyncedIds.isEmpty()){
            return List.of();
        }
        Pageable pageable = PageRequest.of(page, 5);
        return  employeeRepository.findFieldOfficersByIds(notSyncedIds, pageable)
                .stream()
                .map(EmployeeMapper::mapToEmployeeAsyncDto)
                .toList();
    }
}

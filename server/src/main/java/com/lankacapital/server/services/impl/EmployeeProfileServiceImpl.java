package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.EmployeeProfileDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.services.EmployeeProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeProfileServiceImpl implements EmployeeProfileService {

    private final EmployeeRepository employeeRepository;

    @Override
    public EmployeeProfileDto getMyProfile(String email) {

        Employee emp = employeeRepository.findByEmail(email);

        if (emp == null) {
            throw new RuntimeException("Employee not found");
        }

        EmployeeProfileDto dto = new EmployeeProfileDto();

        dto.setId(emp.getId());
        dto.setFirstName(emp.getFirstName());
        dto.setLastName(emp.getLastName());
        dto.setEmail(emp.getEmail());
        dto.setPhoneNumber(emp.getPhoneNumber());
        dto.setAddress(emp.getAddress());

        dto.setRole(emp.getRole().getRoleName());
        dto.setAccountStatus(emp.getAccountStatus());

        return dto;
    }

    @Override
    public EmployeeProfileDto updateMyProfile(String email, EmployeeProfileDto dto) {

        Employee emp = employeeRepository.findByEmail(email);

        if (emp == null) {
            throw new RuntimeException("Employee not found");
        }

        emp.setFirstName(dto.getFirstName());
        emp.setLastName(dto.getLastName());
        emp.setPhoneNumber(dto.getPhoneNumber());
        emp.setAddress(dto.getAddress());

        employeeRepository.save(emp);

        return mapToDto(emp);
    }

    private EmployeeProfileDto mapToDto(Employee emp) {

        EmployeeProfileDto dto = new EmployeeProfileDto();

        dto.setId(emp.getId());
        dto.setFirstName(emp.getFirstName());
        dto.setLastName(emp.getLastName());
        dto.setEmail(emp.getEmail());
        dto.setPhoneNumber(emp.getPhoneNumber());
        dto.setAddress(emp.getAddress());

        dto.setRole(emp.getRole().getRoleName());
        dto.setAccountStatus(emp.getAccountStatus());

        return dto;
    }
}
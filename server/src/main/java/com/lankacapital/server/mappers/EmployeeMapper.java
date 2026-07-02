package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.EmployeeAddDto;
import com.lankacapital.server.dtos.EmployeeResponseDto;
import com.lankacapital.server.dtos.FieldOfficerResAsyncDto;
import com.lankacapital.server.entities.Employee;

public class EmployeeMapper {

    public static Employee mapToEmployee(EmployeeAddDto dto){
        Employee employee = new Employee();

        employee.setNic(dto.getNic());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());

        employee.setAddress(dto.getAddress());
        employee.setPhoneNumber(dto.getPhoneNumber());
        employee.setBasicSalary(dto.getBasicSalary());

        return employee;
    }

    public static EmployeeResponseDto mapToEmployeeResponseDto(Employee employee){
        EmployeeResponseDto dto = new EmployeeResponseDto();

        dto.setId(employee.getId());
        dto.setNic(employee.getNic());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setRole(employee.getRole());
        dto.setAddress(employee.getAddress());
        dto.setPhoneNumber(employee.getPhoneNumber());
        dto.setBasicSalary(employee.getBasicSalary());

        return dto;
    }

    public static FieldOfficerResAsyncDto mapToEmployeeAsyncDto(Employee employee) {
        FieldOfficerResAsyncDto dto = new FieldOfficerResAsyncDto();

        dto.setId(employee.getId());
        dto.setNic(employee.getNic());
        dto.setFirst_name(employee.getFirstName());
        dto.setLast_name(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setAddress(employee.getAddress());
        dto.setPhone_number(employee.getPhoneNumber());

        return dto;
    }

}

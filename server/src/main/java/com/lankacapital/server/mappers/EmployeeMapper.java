package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.EmployeeAddDto;
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
}

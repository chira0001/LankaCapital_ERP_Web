package com.lankacapital.server.services;

import com.lankacapital.server.dtos.EmployeeAddDto;
import com.lankacapital.server.entities.Employee;

public interface EmployeeService {

    Employee addNewEmployee(EmployeeAddDto dto);

}

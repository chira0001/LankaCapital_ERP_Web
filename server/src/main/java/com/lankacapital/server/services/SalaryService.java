package com.lankacapital.server.services;

import com.lankacapital.server.dtos.EmployeeSalaryAddDto;

import java.util.List;

public interface SalaryService {

    void addSalaryToEmployee(List<EmployeeSalaryAddDto> dtoList);

}

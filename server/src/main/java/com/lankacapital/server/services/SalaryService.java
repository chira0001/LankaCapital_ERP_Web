package com.lankacapital.server.services;

import com.lankacapital.server.dtos.AdminDto.SalaryResponseDto;
import com.lankacapital.server.dtos.EmployeeSalaryAddDto;

import java.util.List;

public interface SalaryService {

    void addSalaryToEmployee(List<EmployeeSalaryAddDto> dtoList, String username);
    List<SalaryResponseDto> fetchSalaryDetails(String yearMonth);
    String approveSalaryDetails(String yearMonth, String username);
}

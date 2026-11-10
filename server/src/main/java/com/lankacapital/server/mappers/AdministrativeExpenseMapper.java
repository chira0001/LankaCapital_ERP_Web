package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.AdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdministrativeExpenseResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.AdministrativeExpense;

public class AdministrativeExpenseMapper {

    public static AdministrativeExpense mapToAdministrativeExpense(AdministrativeExpenseDto administrativeExpenseDto){
        AdministrativeExpense administrativeExpense = new AdministrativeExpense();

        administrativeExpense.setNarration(administrativeExpenseDto.getNarration());
        administrativeExpense.setAmount(administrativeExpenseDto.getAmount());

        return administrativeExpense;
    }

    public static AdministrativeExpenseResponseDto mapToAdministrativeExpenseResponseDto(AdministrativeExpense administrativeExpense){
        AdministrativeExpenseResponseDto dto = new AdministrativeExpenseResponseDto();

        dto.setId(administrativeExpense.getId());
        dto.setDateTime(administrativeExpense.getDateTime());
        dto.setNarration(administrativeExpense.getNarration());
        dto.setAmount(administrativeExpense.getAmount());
        dto.setRequest(administrativeExpense.getRequest());

        if(administrativeExpense.getRequestEmployee() != null){
            dto.setRequestEmployee(EmployeeMapper.mapToEmployeeResponseDto(administrativeExpense.getRequestEmployee()));
        }else {
            dto.setRequestEmployee(EmployeeMapper.mapToEmployeeResponseDto(new Employee()));
        }

        if(administrativeExpense.getUpdatedEmployee() != null){
            dto.setUpdatedEmployee(EmployeeMapper.mapToEmployeeResponseDto(administrativeExpense.getUpdatedEmployee()));
        }else {
            dto.setUpdatedEmployee(EmployeeMapper.mapToEmployeeResponseDto(new Employee()));
        }

        if(administrativeExpense.getApprovedEmployee() != null){
            dto.setApprovedEmployee(EmployeeMapper.mapToEmployeeResponseDto(administrativeExpense.getApprovedEmployee()));
        }else {
            dto.setApprovedEmployee(EmployeeMapper.mapToEmployeeResponseDto(new Employee()));
        }

        dto.setAdministrativeExpenseCategory(AdministrativeExpenseCategoryMapper.mapToAdministrativeExpenseCategoryResponseDto(administrativeExpense.getAdministrativeExpenseCategory()));

        return dto;
    }
}

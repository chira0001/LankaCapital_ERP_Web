package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.AdminDto.AdministrativeExpenseCategoryResponseDto;
import com.lankacapital.server.entities.AdministrativeExpenseCategory;

public class AdministrativeExpenseCategoryMapper {

    public static AdministrativeExpenseCategoryResponseDto mapToAdministrativeExpenseCategoryResponseDto(AdministrativeExpenseCategory dto){
        AdministrativeExpenseCategoryResponseDto resDto = new AdministrativeExpenseCategoryResponseDto();
        resDto.setId(dto.getId());
        resDto.setCategoryName(dto.getCategoryName());
        resDto.setCreatedBy(EmployeeMapper.mapToEmployeeResponseDto(dto.getCreatedEmployee()));
        return resDto;
    }

}

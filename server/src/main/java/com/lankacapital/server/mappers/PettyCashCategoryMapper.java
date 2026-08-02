package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.AdminDto.PettyCashCategoryResponseDto;
import com.lankacapital.server.entities.PettyCashCategory;

public class PettyCashCategoryMapper {

    public static PettyCashCategoryResponseDto mapToPettyCashCategoryResponseDto(PettyCashCategory dto){
        PettyCashCategoryResponseDto resDto = new PettyCashCategoryResponseDto();
        resDto.setId(dto.getId());
        resDto.setCategoryName(dto.getCategoryName());
        resDto.setCreatedBy(EmployeeMapper.mapToEmployeeResponseDto(dto.getCreatedEmployee()));
        return resDto;
    }

}

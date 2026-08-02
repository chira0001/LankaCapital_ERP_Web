package com.lankacapital.server.dtos.AdminDto;

import com.lankacapital.server.dtos.EmployeeResponseDto;
import lombok.Data;

@Data
public class PettyCashCategoryResponseDto {

    private Integer id;
    private String categoryName;
    private EmployeeResponseDto createdBy;

}

package com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class WorkingAdministrativeExpenseDto {
    private String adminExpenseName;
    private BigDecimal adminExpenseAmount;
}

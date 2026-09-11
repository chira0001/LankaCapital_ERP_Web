package com.lankacapital.server.dtos.StatementDto;

import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAssetsDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingEPFETFDto;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class WORKING {
    private BigDecimal interestIncome;
    private List<WorkingAdministrativeExpenseDto> workingAdministrativeExpenseDtos;
    private List<WorkingAssetsDto> workingAssetsDtos;
    private List<WorkingEPFETFDto> workingEPFETFDtos;
}

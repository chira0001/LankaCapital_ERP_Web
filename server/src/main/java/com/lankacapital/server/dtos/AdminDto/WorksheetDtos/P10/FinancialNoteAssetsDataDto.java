package com.lankacapital.server.dtos.AdminDto.WorksheetDtos.P10;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;

@Data
public class FinancialNoteAssetsDataDto {
    public LocalDate balanceAtDate;
    private List<HashMap<String, BigDecimal>> costValue;
    private List<HashMap<String, BigDecimal>> depreciationValue;
}

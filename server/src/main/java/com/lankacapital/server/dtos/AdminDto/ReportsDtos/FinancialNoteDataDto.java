package com.lankacapital.server.dtos.AdminDto.ReportsDtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FinancialNoteDataDto {
    private LocalDate financialDate;
    private LocalDate balanceAtDate;
    private BigDecimal openingBalance;
    private BigDecimal depreciationBalance;
    private Integer years;
    private Long assetId;
}

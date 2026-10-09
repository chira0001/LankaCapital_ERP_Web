package com.lankacapital.server.dtos.AdminDto.ReportsDtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IncomeTaxDataDto {
    private LocalDate financialDate;
    private BigDecimal withholdingAmount;
    private LocalDate balanceBFDate;
    private BigDecimal balanceBFAmount;
    private BigDecimal investmentIncome;
    private BigDecimal businessIncome;
}

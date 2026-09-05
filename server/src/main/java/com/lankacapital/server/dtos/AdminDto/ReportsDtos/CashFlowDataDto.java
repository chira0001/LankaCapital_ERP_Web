package com.lankacapital.server.dtos.AdminDto.ReportsDtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CashFlowDataDto {
    private LocalDate financialDate;
    private BigDecimal incomeTaxPaidAmount;
    private BigDecimal cashInHandAmount;
    private BigDecimal openingCashBalance;
}

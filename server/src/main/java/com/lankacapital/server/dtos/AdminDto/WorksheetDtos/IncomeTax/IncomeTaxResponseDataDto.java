package com.lankacapital.server.dtos.AdminDto.WorksheetDtos.IncomeTax;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;

@Data
public class IncomeTaxResponseDataDto {
    private BigDecimal withholdingPayments;
    private List<HashMap<String, Integer>> assetYear;
    private HashMap<LocalDate, BigDecimal> balanceBF;
    private BigDecimal investmentIncome;
    private BigDecimal businessIncome;
}


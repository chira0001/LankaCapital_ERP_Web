package com.lankacapital.server.dtos.AdminDto.ReportsDtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EquityChangeDto {
    private String financialDate;
    private String dataName;
    private BigDecimal statedCapitalAmount;
    private BigDecimal retainedEarningAmount;
}

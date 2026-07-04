package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class MonthlyTrendDto {

    private String month;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal profit;
}
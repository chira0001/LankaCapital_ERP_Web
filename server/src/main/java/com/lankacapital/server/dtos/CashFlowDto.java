package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class CashFlowDto {

    private String period;

    private BigDecimal cashIn;
    private BigDecimal cashOut;
    private BigDecimal netCashFlow;
}
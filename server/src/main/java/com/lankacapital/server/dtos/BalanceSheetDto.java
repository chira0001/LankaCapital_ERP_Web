package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class BalanceSheetDto {

    private String period;

    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal equity;
}
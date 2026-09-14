package com.lankacapital.server.dtos.StatementDto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CF {
    private BigDecimal cashInHandAmount;
    private BigDecimal openingCashBalance;
}

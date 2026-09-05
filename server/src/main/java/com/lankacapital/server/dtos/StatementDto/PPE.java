package com.lankacapital.server.dtos.StatementDto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PPE {
    private String asset;
    private LocalDate monthOfPurchased;
    private Double rate;
    private BigDecimal amount;
    private LocalDate monthStartingDepreciation;
    private Integer date;
    private BigDecimal depreciationAmount;
}

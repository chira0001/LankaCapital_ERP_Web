package com.lankacapital.server.dtos.ReceptionistDto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RecepLoanUpdateDto {

    private String fileNumber;
    private BigDecimal documentCharge;
    private Double interestRate;
}

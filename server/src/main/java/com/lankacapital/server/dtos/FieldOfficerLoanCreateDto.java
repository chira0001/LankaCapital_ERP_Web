package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FieldOfficerLoanCreateDto {

    private String customerNic;
    private BigDecimal amount;
    private String employeeEmail;

}

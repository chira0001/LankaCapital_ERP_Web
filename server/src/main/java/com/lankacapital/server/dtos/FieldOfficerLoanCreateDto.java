package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FieldOfficerLoanCreateDto {

    private Long customerNic;
    private BigDecimal amount;
    private Long employeeId;
    private Integer installmentId;
}

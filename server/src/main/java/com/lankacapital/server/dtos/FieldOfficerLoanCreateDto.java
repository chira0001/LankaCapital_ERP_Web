package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FieldOfficerLoanCreateDto {

    private String customerId;
    private BigDecimal amount;
    private Long employeeId;

}

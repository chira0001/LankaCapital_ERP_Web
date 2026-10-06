package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LoanStatusDto {
    private String fileNumber;
    private BigDecimal paidAmount;
    private Integer installmentNo;
    private LocalDateTime lastPaidAt;
}

package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LoanResAsyncDto {
    private String fileNumber;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private BigDecimal documentCharge;
    private String rejectionNote;
    private String status;
    private String customerId;
    private Long employeeId;
    private Integer installment;
    private Double interestRate;
    private Long updateStatus;
}

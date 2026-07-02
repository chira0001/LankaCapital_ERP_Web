package com.lankacapital.server.dtos;

import com.lankacapital.server.enums.LoanStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LoanResDto {
    private String fileNumber;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private Double documentCharge;
    private LoanStatus status;
    private String rejectionNote;
    private InstallmentResDto installments;
    private EmployeeResDto employee;
    private InterestRateResDto interestRate;
}

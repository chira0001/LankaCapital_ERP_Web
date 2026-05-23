package com.lankacapital.server.dtos;

import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.RiskLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanResponseDto {

    private String fileNumber;
    private Double interestRate;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private Integer noOfInstallments;
    private Double documentCharge;
    private Long employeeId;
    private LoanStatus status;
    private CustomerInfoDto customer;



}

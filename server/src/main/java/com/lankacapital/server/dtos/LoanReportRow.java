package com.lankacapital.server.dtos;

import com.lankacapital.server.enums.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanReportRow {
    private String fileNumber;
    private String customerId;
    private String applicantName;
    private BigDecimal amount;
    private Double interestRate;
    private Integer noOfInstallments;
    private LoanStatus status;
    private Long employeeId;
    private String officerName;
    private BigDecimal documentCharge;
    private LocalDateTime createdAt;
    private String decisionNote;
}

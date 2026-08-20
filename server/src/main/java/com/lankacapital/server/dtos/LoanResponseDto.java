package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.enums.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanResponseDto {

    private String fileNumber;
    private Double interestRate;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDate endAt;
    private Integer noOfInstallments;
    private Double documentCharge;
    private EmployeeResponseDto enteredBy;
    private EmployeeResponseDto updatedBy;
    private EmployeeResponseDto approvedBy;
    private LoanStatus status;
    private String decisionNote;
    private CustomerResponseDto customer;
    private String loanType;
}

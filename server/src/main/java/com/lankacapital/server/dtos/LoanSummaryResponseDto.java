package com.lankacapital.server.dtos;

import com.lankacapital.server.enums.LoanType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class LoanSummaryResponseDto {
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private String fileNumber;
    private Integer installment;
    private Double interestRate;
    private EmployeeResponseDto approvedEmployee;
    private CustomerResponseDto customer;
    private LoanType loanType;
    private LocalDate endAt;
    private BigDecimal installmentValue;
    private BigDecimal remainingBalance;
    private BigDecimal arrearsAmount;
    private List<DailyCollectionResponseDto> dailyCollection;
}

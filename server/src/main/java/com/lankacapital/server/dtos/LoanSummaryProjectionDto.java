package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.enums.LoanType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LoanSummaryProjectionDto {

    private BigDecimal amount;
    private LocalDateTime createdAt;
    private String fileNumber;
    private Integer installment;
    private Double interestRate;
    private LoanType loanType;
    private LocalDate endAt;
    private BigDecimal totalPaid;
//    private Customer customer;
}

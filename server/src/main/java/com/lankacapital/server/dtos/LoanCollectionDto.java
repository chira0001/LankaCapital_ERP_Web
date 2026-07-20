package com.lankacapital.server.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LoanCollectionDto {
    private Double amount;
    private LocalDateTime createdAt;
    private Double interestRate;
    private Integer installment;
    private Long enteredBy;
    private String loanType;

    private Double totalAmount;
    private Integer lastInstallmentNo;
    private Double installmentAmount;
    private Double dueAmount;
//    private Double preClosureAmount;

    private String customerNic;
    private String customerName;
    private String customerAddress;
}

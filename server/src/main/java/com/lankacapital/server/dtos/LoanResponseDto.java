package com.lankacapital.server.dtos;

import com.lankacapital.server.enums.LoanStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoanResponseDto {

    private String fileNumber;
    private Double interestRate;
    private String amount;
    private LocalDateTime createdAt;
    private Integer noOfInstallments;
    private Double documentCharge;
    private Long employeeId;
    private LoanStatus status;
   // private Long customerId;

    private CustomerInfoDto customer;



}

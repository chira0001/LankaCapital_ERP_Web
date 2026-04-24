package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Installment;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class LoanCreateDto {
    private String fileNumber;
    private BigDecimal loanAmount;
    private Double interestRate;
    private BigDecimal documentCharge;
    private Double numberOfInstallments;
    private Long employeeId;

    private Long customerId;

    private String name;
    private String email;
    private String address;
    private String phoneNumber;
}

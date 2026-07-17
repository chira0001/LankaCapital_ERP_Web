package com.lankacapital.server.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FieldOfficerLoanCreateDto {
    private Integer id;
    private String customerNic;
    private BigDecimal amount;
    private Long employeeId;
    private Integer installment;
    private LocalDateTime createdAt;
    private String loanType;
}

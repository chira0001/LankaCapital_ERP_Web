package com.lankacapital.server.dtos.AdminDto;

import com.lankacapital.server.dtos.EmployeeResponseDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AdminDailyCollectionResponseDto {

    private BigDecimal dueAmount;
    private Integer installmentNumber;
    private BigDecimal paidAmount;
    private LocalDateTime paidAt;
    private EmployeeResponseDto enteredBy;
    private LoanResponseDto loan;
}

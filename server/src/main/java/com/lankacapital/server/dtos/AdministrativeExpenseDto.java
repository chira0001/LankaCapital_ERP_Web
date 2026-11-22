package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AdministrativeExpenseDto {
    private String narration;
    private BigDecimal amount;
    private Integer category;
    private LocalDate expenseDate;
}

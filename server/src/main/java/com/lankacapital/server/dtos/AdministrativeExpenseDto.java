package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Employee;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdministrativeExpenseDto {
    private String narration;
    private BigDecimal amount;
    private Integer category;
}

package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Employee;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PettyCashDto {
    private String narration;
    private BigDecimal amount;
}

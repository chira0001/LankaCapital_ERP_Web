package com.lankacapital.server.dtos;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.enums.Request;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PettyCashResponseDto {
    private Long id;
    private LocalDateTime dateTime;
    private String narration;
    private BigDecimal amount;
    private EmployeeResponseDto requestEmployee;
    private EmployeeResponseDto approvedEmployee;
    private Request request;
}

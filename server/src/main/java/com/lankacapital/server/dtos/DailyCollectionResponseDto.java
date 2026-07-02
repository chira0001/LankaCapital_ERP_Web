package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DailyCollectionResponseDto {
    private UUID id;
    private Integer installmentNumber;
    private BigDecimal paidAmount;
    private LocalDateTime paidAt;
    private Long employeeId;
    private String fileNumber;
}

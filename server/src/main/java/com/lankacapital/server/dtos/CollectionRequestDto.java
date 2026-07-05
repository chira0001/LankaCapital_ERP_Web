package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CollectionRequestDto {
    private String fileNumber;
    private Integer installmentNumber;
    private BigDecimal paidAmount;
    private Long employeeId;
    private BigDecimal dueAmount;
}

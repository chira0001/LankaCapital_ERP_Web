package com.lankacapital.server.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CollectionResDto {
    private String fileNumber;
    private Double dueAmount;
    private Integer installmentNo;
    private Double totalPaid;
    private LocalDateTime paidAt;
}

package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class DailyCollectionDto {

    private String date;
    private BigDecimal totalCollected;
    private String officerName;
    private String customerName;
    private BigDecimal amount;
    private Integer totalTransactions;
}
package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DailyCollectionSummaryDto {

    private String date;

    private BigDecimal totalCollected;

    private int totalTransactions;

    private String officerName;
}
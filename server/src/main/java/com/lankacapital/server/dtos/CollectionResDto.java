package com.lankacapital.server.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CollectionResDto {
    private String fileNumber;
    private BigDecimal dueAmount;
    private Integer installmentNo;
}

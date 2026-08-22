package com.lankacapital.server.dtos.AdminDto.ReportsDtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AssetsDto {
    private String assetName;
    private String purchasedMonth;
    private String rate;
    private BigDecimal amount;
}

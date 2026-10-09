package com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WorkingAssetsDto {
    private String assetName;
    private BigDecimal assetAmount;
}

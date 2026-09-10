package com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WorkingEPFETFDto {
    private String date;
    private BigDecimal EPF20;

    public WorkingEPFETFDto(String month, BigDecimal EPF20){
        this.date = month;
//        this.date = LocalDate.parse(month);
        this.EPF20 = EPF20;
    }
}

package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.EquityChangeDto;
import com.lankacapital.server.entities.reports.EquityChange;

import java.time.LocalDate;

public class EquityChangeMapper {

    public static EquityChangeDto mapToEquityChangeDto (EquityChange equityChange){
        EquityChangeDto dto = new EquityChangeDto();

        dto.setFinancialDate(equityChange.getDataName());
        dto.setDataName(equityChange.getDataName());
        dto.setStatedCapitalAmount(equityChange.getStatedCapitalAmount());
        dto.setRetainedEarningAmount(equityChange.getRetainedEarningAmount());

        return dto;
    }

    public static EquityChange mapToEquityChange(EquityChangeDto dto){
        EquityChange change = new EquityChange();

        change.setFinancialDate(LocalDate.parse(dto.getFinancialDate()));
        change.setDataName(dto.getDataName());
        change.setStatedCapitalAmount(dto.getStatedCapitalAmount());
        change.setRetainedEarningAmount(dto.getRetainedEarningAmount());

        return change;
    }
}

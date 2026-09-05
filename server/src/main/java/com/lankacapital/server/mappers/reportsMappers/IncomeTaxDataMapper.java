package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.IncomeTaxDataDto;
import com.lankacapital.server.entities.reports.IncomeTaxData;

public class IncomeTaxDataMapper {

    public static IncomeTaxData mapToIncomeTaxData(IncomeTaxDataDto dto){
        IncomeTaxData data = new IncomeTaxData();

        data.setFinancialDate(dto.getFinancialDate());
        data.setWithholdingAmount(dto.getWithholdingAmount());
        data.setBalanceBFDate(dto.getBalanceBFDate());
        data.setBalanceBFAmount(dto.getBalanceBFAmount());
        data.setInvestmentIncome(dto.getInvestmentIncome());
        data.setBusinessIncome(dto.getBusinessIncome());

        return data;
    }

    public static IncomeTaxDataDto mapToIncomeTaxDataDto(IncomeTaxData entity){
        IncomeTaxDataDto dto = new IncomeTaxDataDto();
        dto.setFinancialDate(entity.getFinancialDate());
        dto.setWithholdingAmount(entity.getWithholdingAmount());
        dto.setBalanceBFDate(entity.getBalanceBFDate());
        dto.setBalanceBFAmount(entity.getBalanceBFAmount());
        dto.setInvestmentIncome(entity.getInvestmentIncome());
        dto.setBusinessIncome(entity.getBusinessIncome());
        return dto;
    }
}

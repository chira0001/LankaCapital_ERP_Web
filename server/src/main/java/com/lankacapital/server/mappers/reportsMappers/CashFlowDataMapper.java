package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.CashFlowDataDto;
import com.lankacapital.server.entities.reports.CashFlowData;

public class CashFlowDataMapper {
    public static CashFlowData mapToCashFlowData(CashFlowDataDto dto){
        CashFlowData flowData = new CashFlowData();

        flowData.setFinancialDate(dto.getFinancialDate());
        flowData.setIncomeTaxPaidAmount(dto.getIncomeTaxPaidAmount());
        flowData.setCashInHandAmount(dto.getCashInHandAmount());
        flowData.setOpeningCashBalance(dto.getOpeningCashBalance());

        return flowData;
    }

    public static CashFlowDataDto mapToCashFlowDataDto(CashFlowData flowData){
        CashFlowDataDto dto = new CashFlowDataDto();

        dto.setFinancialDate(flowData.getFinancialDate());
        dto.setIncomeTaxPaidAmount(flowData.getIncomeTaxPaidAmount());
        dto.setCashInHandAmount(flowData.getCashInHandAmount());
        dto.setOpeningCashBalance(flowData.getOpeningCashBalance());

        return dto;
    }
}

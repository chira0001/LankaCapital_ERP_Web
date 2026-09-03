package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.FinancialNoteDataDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;
import com.lankacapital.server.entities.reports.FinancialNoteData;

public class FinancialNoteDataMapper {

    public static FinancialNoteData mapToFinancialNoteData(FinancialNoteDataDto dto, AssetsRegistry assetsRegistry){
        FinancialNoteData data = new FinancialNoteData();

        data.setFinancialDate(dto.getFinancialDate());
        data.setBalanceAtDate(dto.getBalanceAtDate());
        data.setOpeningBalance(dto.getOpeningBalance());
        data.setDepreciationBalance(dto.getDepreciationBalance());
        data.setAssetsRegistry(assetsRegistry);

        return data;
    }

}

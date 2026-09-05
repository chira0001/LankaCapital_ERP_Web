package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.NoteSharesDataDto;
import com.lankacapital.server.entities.reports.NoteSharesData;

public class NoteSharesDataMapper {

    public static NoteSharesData mapToNoteSharesData(NoteSharesDataDto dto) {
        NoteSharesData entity = new NoteSharesData();
        entity.setFinancialDate(dto.getFinancialDate());
        entity.setNumberOfShares(dto.getNumberOfShares());
        return entity;
    }

    public static NoteSharesDataDto mapToNoteSharesDataDto(NoteSharesData entity) {
        NoteSharesDataDto dto = new NoteSharesDataDto();
        dto.setFinancialDate(entity.getFinancialDate());
        dto.setNumberOfShares(entity.getNumberOfShares());
        return dto;
    }
}

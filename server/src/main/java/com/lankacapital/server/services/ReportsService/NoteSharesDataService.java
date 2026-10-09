package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.NoteSharesDataDto;

public interface NoteSharesDataService {
    String addNoteSharesData(NoteSharesDataDto dto);
    NoteSharesDataDto getNoteSharesData(java.time.LocalDate financialDate);
}

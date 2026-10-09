package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.FinancialNoteDataDto;
import com.lankacapital.server.entities.reports.FinancialNoteData;

import java.util.List;

public interface FinancialNoteDataService {
    String addFinancialNoteData(List<FinancialNoteDataDto> dataDtos);
}

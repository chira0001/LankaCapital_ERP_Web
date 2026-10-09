package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.IncomeTaxDataDto;

import java.time.LocalDate;

public interface IncomeTaxDataService {

    String addNoteIncomeTax(IncomeTaxDataDto dto);
    IncomeTaxDataDto getIncomeTaxByFinancialDate(LocalDate financialDate);
}

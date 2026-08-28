package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.TrialBalanceDataDto;

import java.time.LocalDate;
import java.util.List;

public interface TrialBalanceDataService {
    List<TrialBalanceDataDto> addToTrialBalance(List<TrialBalanceDataDto> trialBalanceDataDtos);
    List<TrialBalanceDataDto> fetchTrialBalances(LocalDate startDate, LocalDate endDate);
}

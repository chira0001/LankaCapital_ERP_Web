package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.CashFlowDataDto;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

public interface CashFlowDataService {
    CashFlowDataDto fetchCashFlow(LocalDate startDate, LocalDate endDate);
    String addCashFlow(CashFlowDataDto dto);
}

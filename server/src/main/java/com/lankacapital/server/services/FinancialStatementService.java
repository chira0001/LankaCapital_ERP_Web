package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.FinancialStatement;

public interface FinancialStatementService {

//    FinancialStatement generateFinancialStatement(String month);
//    List<FinancialStatement> getFinancialStatement(String startMonth, String endMonth);
//    FinancialStatement updateFinancialStatement(Long id, FinancialStatementDto dto);
//    List<FinancialStatement> getByDateRange(LocalDate start, LocalDate end);
//    FinancialDashboardDto getFinancialDashboard(String month);
//    ProfitLossDto getProfitLoss(String month);
//    byte[] generateFinancialReportPdf(String month);
//    CashFlowDto getCashFlow(String month);
//    BalanceSheetDto getBalanceSheet(String month);
//    FinancialReportDto getFinancialReport(String month);
//    List<FinancialStatement> importAssetsLiabilities(org.springframework.web.multipart.MultipartFile file);
//    FinancialReportDto getAnnualFinancialReport(String year);
//    BalanceSheetDto getAnnualBalanceSheet(String year);
//    CashFlowDto getAnnualCashFlow(String year);

    FinancialStatement generateReports(String reportType,String startDate, String endDate);
    String addFinancials(String username, FinancialRequestDto financialRequestDto);
}
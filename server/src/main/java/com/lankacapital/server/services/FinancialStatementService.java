package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.FinancialStatement;

import java.time.LocalDate;
import java.util.List;

public interface FinancialStatementService {

    FinancialStatement generateFinancialStatement(String month);



   // List<FinancialStatement> getFinancialStatement(String month);


    List<FinancialStatement> getFinancialStatement(String startMonth, String endMonth);

    FinancialStatement updateFinancialStatement(Long id,
                                                FinancialStatementDto dto);

    List<FinancialStatement> getByDateRange(LocalDate start, LocalDate end);

    FinancialDashboardDto getFinancialDashboard(String month);

   // List<FinancialStatement> getByDateRange(LocalDate start, LocalDate end);
    List<MonthlyTrendDto> getMonthlyTrend(String month);
    ProfitLossDto getProfitLoss(String month);
    byte[] generateFinancialReportPdf(String month);
    CashFlowDto getCashFlow(String month);
    BalanceSheetDto getBalanceSheet(String month);
    FinancialReportDto getFinancialReport(String month);
    FinancialStatement getFinancialStatement(String month);

    List<FinancialStatement> importAssetsLiabilities(org.springframework.web.multipart.MultipartFile file);

    //annually
    FinancialReportDto getAnnualFinancialReport(String year);

    BalanceSheetDto getAnnualBalanceSheet(String year);

    CashFlowDto getAnnualCashFlow(String year);


}
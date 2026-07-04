package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.repositories.DailyCollectionRepository;
//import com.lankacapital.server.services.FinancialStatementService;
import com.lankacapital.server.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final DailyCollectionRepository dailyCollectionRepository;

    @Override
    public List<DailyCollectionResponseDto> getDailyCollectionDetails(LocalDate date) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<DailyCollection> list =
                dailyCollectionRepository.findByPaidAtBetween(start, end);

        return list.stream().map(c -> {

            DailyCollectionResponseDto dto = new DailyCollectionResponseDto();

            dto.setId(c.getId());
            dto.setInstallmentNumber(c.getInstallmentNumber());
            dto.setPaidAmount(c.getPaidAmount());
            dto.setPaidAt(c.getPaidAt());

            dto.setEmployeeId(
                    c.getEmployee() != null ? c.getEmployee().getId() : null
            );

            dto.setFileNumber(
                    c.getLoan() != null ? c.getLoan().getFileNumber() : null
            );

            return dto;

        }).toList();
    }

    @Override
    public DailyCollectionDto getDailyCollectionSummary(LocalDate date) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<DailyCollection> list =
                dailyCollectionRepository.findByPaidAtBetween(start, end);

        BigDecimal total = list.stream()
                .map(DailyCollection::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DailyCollectionDto dto = new DailyCollectionDto();

        dto.setDate(date.toString());
        dto.setTotalCollected(total);
        dto.setTotalTransactions(list.size());

        // optional: first officer name
        if (!list.isEmpty() && list.get(0).getEmployee() != null) {
            dto.setOfficerName(list.get(0).getEmployee().getFirstName());
        }

        return dto;
    }


//    private final FinancialStatementService financialStatementService;
//
//    @Override
//    public FinancialReportDto getAnnualFinancialReport(String year) {
//        return financialStatementService.getAnnualFinancialReport(year);
//    }
//
//    @Override
//    public BalanceSheetDto getAnnualBalanceSheet(String year) {
//        return financialStatementService.getAnnualBalanceSheet(year);
//    }
//
//    @Override
//    public CashFlowDto getAnnualCashFlow(String year) {
//        return financialStatementService.getAnnualCashFlow(year);
//    }


}
package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAssetsDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingEPFETFDto;
import com.lankacapital.server.dtos.StatementDto.PPE;
import com.lankacapital.server.dtos.StatementDto.WORKING;
import com.lankacapital.server.entities.reports.AssetsRegistry;
import com.lankacapital.server.mappers.statementMappers.PPE_WORKING_Mapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.LoanRepository;
import com.lankacapital.server.repositories.PettyCashRepository;
import com.lankacapital.server.repositories.ReportsRepository.*;
import com.lankacapital.server.repositories.SalaryRepository;
import com.lankacapital.server.services.*;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Service
@AllArgsConstructor
public class FinancialStatementServiceImpl implements FinancialStatementService {

    private final EmployeeRepository employeeRepository;
    private final LoanRepository loanRepository;
    private final PettyCashRepository pettyCashRepository;
    private final SalaryRepository salaryRepository;

    private final AssetsRegistryRepository assetsRegistryRepository;
    private final CashFlowDataRepository cashFlowDataRepository;
    private final EquityChangeRepository equityChangeRepository;
    private final FinancialNoteDataRepository financialNoteDataRepository;
    private final IncomeTaxDataRepository incomeTaxDataRepository;
    private final NoteSharesDataRepository noteSharesDataRepository;
    private final TrialBalanceDataRepository trialBalanceDataRepository;

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private List<PPE> generatePPE() {
        List<AssetsRegistry> assetsRegistries = assetsRegistryRepository.findAll();
        List<PPE> ppeList = new ArrayList<>();
        for (AssetsRegistry registry : assetsRegistries) {
            PPE ppe = new PPE();
            ppe.setAsset(registry.getAssetName());
            ppe.setMonthOfPurchased(registry.getPurchasedDate());
            ppe.setRate(registry.getRate());
            ppe.setAmount(registry.getAmount());
            ppe.setMonthStartingDepreciation(registry.getDepreciatedDate());
            long days = ChronoUnit.DAYS.between(
                    registry.getPurchasedDate(),
                    registry.getDepreciatedDate()
            );
            ppe.setDate((int) days);

            BigDecimal depAmount = registry.getAmount()
                    .divide(BigDecimal.valueOf(registry.getRate()),2,RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(days)
                            .divide(BigDecimal.valueOf(365),2, RoundingMode.HALF_UP));

            ppe.setDepreciationAmount(depAmount);
            ppeList.add(ppe);
        }
        return ppeList;
    }

    private WORKING generateWORKING(LocalDate beginPeriod, LocalDate endPeriod){

        String startDate = beginPeriod.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String endDate = endPeriod.format(DateTimeFormatter.ofPattern("yyyy-MM"));

//        LocalDateTime startDateTime = LocalDateTime.parse(beginPeriod + "T00:00:00");
//        LocalDateTime endDateTime = LocalDateTime.parse(endPeriod + "T23:59:59");

        LocalDateTime startDateTime = beginPeriod.atStartOfDay();
        LocalDateTime endDateTime = endPeriod.plusDays(1).atStartOfDay();

        System.out.println("-------------------------------" + startDate + "========== " + endDate);

        WORKING working = new WORKING();
        BigDecimal income = loanRepository.fetchApprovedLoansAndCreatedAtBetweenStartPeriodAndEndPeriod(startDateTime,endDateTime);
        working.setInterestIncome(income);

        List<WorkingAdministrativeExpenseDto> expenseDtos = pettyCashRepository.fetchApprovedPettyCashAndDateTimeBetweenStartPeriodAndEndPeriod(beginPeriod, endPeriod);
        working.setWorkingAdministrativeExpenseDtos(expenseDtos);

        List<PPE> ppeList = generatePPE();
        List<WorkingAssetsDto> workingAssetsDtos = ppeList.stream().map(PPE_WORKING_Mapper::mapToWorkingAssetsDto).toList();
        working.setWorkingAssetsDtos(workingAssetsDtos);

        List<WorkingEPFETFDto> epfetfDtos = salaryRepository.fetchEPF(startDate, endDate);
        working.setWorkingEPFETFDtos(epfetfDtos);
        return working;
    }

    @Override
    @Transactional
    public HashMap<String, Object> generateReports(String reportType, String startDate, String endDate) {

        try {
            HashMap<String, Object> data = new HashMap<>();

            LocalDate beginPeriod = LocalDate.parse(startDate);
            LocalDate endPeriod = LocalDate.parse(endDate);

            if(reportType.equalsIgnoreCase("ppe")){
                data.put("ppe",generatePPE());
            }else if(reportType.equalsIgnoreCase("working")){
                data.put("working",generateWORKING(beginPeriod, endPeriod));
            }else if(reportType.equalsIgnoreCase("statement")){
                data.put("ppe",generatePPE());
                data.put("working",generateWORKING(beginPeriod, endPeriod));
            }

            return data;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}


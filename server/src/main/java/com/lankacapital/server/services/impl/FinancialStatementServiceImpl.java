package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.TrialBalanceDataDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAssetsDto;
import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingEPFETFDto;
import com.lankacapital.server.dtos.StatementDto.CE;
import com.lankacapital.server.dtos.StatementDto.PPE;
import com.lankacapital.server.dtos.StatementDto.TRIALBALANCE;
import com.lankacapital.server.dtos.StatementDto.WORKING;
import com.lankacapital.server.entities.reports.AssetsRegistry;
import com.lankacapital.server.entities.reports.EquityChange;
import com.lankacapital.server.entities.reports.TrialBalanceData;
import com.lankacapital.server.enums.AccountType;
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
import java.util.*;
import java.util.stream.Collectors;

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

    @Transactional
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

    @Transactional
    private WORKING generateWORKING(LocalDate beginPeriod, LocalDate endPeriod){

        String startDate = beginPeriod.format(DateTimeFormatter.ofPattern("yyyy-MM"));
        String endDate = endPeriod.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        LocalDateTime startDateTime = beginPeriod.atStartOfDay();
        LocalDateTime endDateTime = endPeriod.plusDays(1).atStartOfDay();

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

    @Transactional
    private TRIALBALANCE generateTRIALBALANCE(LocalDate beginPeriod, LocalDate endPeriod) {
        List<TrialBalanceData> rows = trialBalanceDataRepository.findByFinancialDateBetween(beginPeriod, endPeriod);
        List<TrialBalanceDataDto> baseDtos = rows.stream()
                .map(PPE_WORKING_Mapper::mapToDto)
                .toList();

        Map<AccountType, List<TrialBalanceDataDto>> grouped = baseDtos.stream()
                .collect(Collectors.groupingBy(
                        TrialBalanceDataDto::getAccountType,
                        () -> new EnumMap<>(AccountType.class),
                        Collectors.toCollection(ArrayList::new)
                ));

        List<TrialBalanceDataDto> ppeDtos = generatePPE().stream()
                .map(PPE_WORKING_Mapper::mapToTrialBalanceDataDtoFromPPE)
                .toList();
        grouped.computeIfAbsent(AccountType.Assets, k -> new ArrayList<>()).addAll(ppeDtos);

        List<WorkingAdministrativeExpenseDto> expenseDtos =
                pettyCashRepository.fetchApprovedPettyCashAndDateTimeBetweenStartPeriodAndEndPeriod(beginPeriod, endPeriod);

        List<TrialBalanceDataDto> expenseTbDtos = expenseDtos.stream()
                .map(PPE_WORKING_Mapper::mapToTrialBalanceDataDtoFromWorkingAdministrativeExpenseDto)
                .toList();
        grouped.computeIfAbsent(AccountType.Expenses, k -> new ArrayList<>()).addAll(expenseTbDtos);

        TRIALBALANCE tb = new TRIALBALANCE();
        tb.setBankAccounts(grouped.getOrDefault(AccountType.BankAccounts, List.of()));
        tb.setAssets(grouped.getOrDefault(AccountType.Assets, List.of()));
        tb.setLiabilities(grouped.getOrDefault(AccountType.Liabilities, List.of()));
        tb.setEquity(grouped.getOrDefault(AccountType.Equity, List.of()));
        tb.setExpenses(grouped.getOrDefault(AccountType.Expenses, List.of()));
        tb.setIncome(grouped.getOrDefault(AccountType.Income, List.of()));

        return tb;
    }

    private CE generateCE(LocalDate beginPeriod, LocalDate endPeriod){
        List<EquityChange> equityChangesList =
                equityChangeRepository.findByFinancialDateBetween(beginPeriod,endPeriod);

        CE ce = new CE();

        for(EquityChange change : equityChangesList){

            String name = change.getDataName();

            if(name != null && name.trim().toLowerCase().startsWith("balance")){
                ce.getRetainedEarningBalance()
                        .put(name, change.getRetainedEarningAmount());

                ce.getStatedCapitalBalance()
                        .put(name, change.getStatedCapitalAmount());
            }
            else if(name != null && name.equalsIgnoreCase("Shares Issued")){
                ce.getRetainedEarningShares()
                        .put(name, change.getRetainedEarningAmount());
            }
            else if(name != null && name.equalsIgnoreCase("Profit or Loss for the Period")){
                ce.getStatedCapitalPL()
                        .put(name, change.getStatedCapitalAmount());
            }
        }

        return ce;
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
            }else if(reportType.equalsIgnoreCase("tb")){
                data.put("tb",generateTRIALBALANCE(beginPeriod, endPeriod));
            }else if(reportType.equalsIgnoreCase("ce")) {
                data.put("ce", generateCE(beginPeriod, endPeriod));
            }else if(reportType.equalsIgnoreCase("statement")){
                data.put("ppe",generatePPE());
                data.put("working",generateWORKING(beginPeriod, endPeriod));
                data.put("tb",generateTRIALBALANCE(beginPeriod, endPeriod));
                data.put("ce", generateCE(beginPeriod, endPeriod));
            }
            return data;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}


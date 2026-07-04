package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.FinancialStatement;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.FinancialStatementMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.FinancialStatementRepository;
import com.lankacapital.server.services.*;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;

@Service
@AllArgsConstructor

public class FinancialStatementServiceImpl implements FinancialStatementService {

    private final LoanService loanService;
    private final MonthlyIncomeService monthlyIncomeService;
    private final MonthlyExpenseService monthlyExpenseService;
    private final PettyCashService pettyCashService;
    private final FinancialStatementRepository financialStatementRepository;
    private final EmployeeRepository employeeRepository;


    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }


    @Override
    public FinancialStatement generateFinancialStatement(String month) {

        LocalDate reportDate = LocalDate.parse(month + "-01");

        FinancialStatement fs = financialStatementRepository
                .findByReportDate(reportDate)
                .orElse(new FinancialStatement());

        fs.setReportDate(reportDate);

        // ------------------------
        // Loan Module
        // ------------------------
        fs.setReceivables(
                loanService.getApprovedLoanTotal()
        );

        // ------------------------
        // Monthly Income
        // ------------------------
        BigDecimal income = monthlyIncomeService
                .getMonthlyIncome(month)
                .map(i -> i.getTotalIncome())
                .orElse(BigDecimal.ZERO);

        fs.setCapital(income);
        // ------------------------
        // Monthly Expense
        // ------------------------
        BigDecimal expense = monthlyExpenseService
                .getMonthlyExpenseReport(month)
                .map(e -> e.getTotalExpenses())
                .orElse(BigDecimal.ZERO);

        fs.setRetainedEarnings(expense);

        // ------------------------
        // Petty Cash
        // ------------------------
        fs.setCashAndCashEquivalent(

                pettyCashService
                        .getApprovedPettyCashTotal()
        );

        // Defaults

        fs.setInventory(BigDecimal.ZERO);
        fs.setPrepaidExpenses(BigDecimal.ZERO);
        fs.setLandBuilding(BigDecimal.ZERO);
        fs.setVehicles(BigDecimal.ZERO);
        fs.setFurniture(BigDecimal.ZERO);
        fs.setEquipment(BigDecimal.ZERO);
        fs.setAccumulatedDepreciation(BigDecimal.ZERO);

        fs.setTradePayables(BigDecimal.ZERO);
        fs.setDirectorCurrentAccount(BigDecimal.ZERO);
        fs.setBankLoan(BigDecimal.ZERO);
        fs.setOtherLiabilities(BigDecimal.ZERO);

        fs.setNotes("Generated for " + month);

        calculateFinancialSummary(fs);
        return financialStatementRepository.save(fs);
    }

//    @Override
//    public List<FinancialStatement> getFinancialStatement(String month) {
//        return List.of();
//    }

    @Override
    public FinancialStatement getFinancialStatement(String month) {

        LocalDate reportDate = LocalDate.parse(month + "-01");

        return financialStatementRepository
                .findByReportDate(reportDate)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Financial statement not found for month: " + month
                        ));
    }

    @Override
    public List<FinancialStatement> importAssetsLiabilities(MultipartFile file) {

        List<FinancialStatement> results = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0); // "Assets & Liabilities" sheet
            DataFormatter formatter = new DataFormatter();

            for (int rowIdx = 1; rowIdx <= sheet.getLastRowNum(); rowIdx++) {
                Row row = sheet.getRow(rowIdx);
                if (row == null) continue;

                String month = formatter.formatCellValue(row.getCell(0)).trim();
                if (month.isEmpty()) continue; // skip blank rows

                LocalDate reportDate;
                try {
                    reportDate = LocalDate.parse(month + "-01");
                } catch (Exception e) {
                    throw new RuntimeException("Row " + (rowIdx + 1) + ": invalid Month format '" + month + "', expected YYYY-MM");
                }

                FinancialStatement fs = financialStatementRepository
                        .findByReportDate(reportDate)
                        .orElseGet(() -> {
                            FinancialStatement newFs = new FinancialStatement();
                            newFs.setReportDate(reportDate);
                            // leave receivables / cash at zero until the normal
                            // generateFinancialStatement() run fills them in
                            return newFs;
                        });

                fs.setInventory(readAmount(row, 1));
                fs.setPrepaidExpenses(readAmount(row, 2));
                fs.setLandBuilding(readAmount(row, 3));
                fs.setVehicles(readAmount(row, 4));
                fs.setFurniture(readAmount(row, 5));
                fs.setEquipment(readAmount(row, 6));
                fs.setAccumulatedDepreciation(readAmount(row, 7));
                fs.setTradePayables(readAmount(row, 8));
                fs.setDirectorCurrentAccount(readAmount(row, 9));
                fs.setBankLoan(readAmount(row, 10));
                fs.setOtherLiabilities(readAmount(row, 11));

                calculateFinancialSummary(fs);   // keeps totals in sync — same fix as before
                results.add(financialStatementRepository.save(fs));
            }

        } catch (Exception e) {
            throw new RuntimeException("Error importing Excel file: " + e.getMessage(), e);
        }

        return results;
    }

    private BigDecimal readAmount(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return BigDecimal.ZERO;
        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    return BigDecimal.valueOf(cell.getNumericCellValue());
                case STRING:
                    String s = cell.getStringCellValue().trim();
                    return s.isEmpty() ? BigDecimal.ZERO : new BigDecimal(s);
                default:
                    return BigDecimal.ZERO;
            }
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    @Override
    public List<FinancialStatement> getFinancialStatement(String startMonth, String endMonth) {

        LocalDate startDate = LocalDate.parse(startMonth + "-01");
        LocalDate endDate = LocalDate.parse(endMonth + "-01");

        return financialStatementRepository.findByReportDateBetween(
                startDate,
                endDate
        );
    }

    @Override
    public FinancialStatement updateFinancialStatement(
            Long id,
            FinancialStatementDto dto) {

        FinancialStatement fs =
                financialStatementRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Financial Statement not found"));

        fs.setReceivables(dto.getReceivables());
        fs.setCashAndCashEquivalent(dto.getCashAndCashEquivalent());
        fs.setInventory(dto.getInventory());
        fs.setPrepaidExpenses(dto.getPrepaidExpenses());
        fs.setLandBuilding(dto.getLandBuilding());
        fs.setVehicles(dto.getVehicles());
        fs.setFurniture(dto.getFurniture());
        fs.setEquipment(dto.getEquipment());
        fs.setAccumulatedDepreciation(dto.getAccumulatedDepreciation());
        fs.setTradePayables(dto.getTradePayables());
        fs.setDirectorCurrentAccount(dto.getDirectorCurrentAccount());
        fs.setBankLoan(dto.getBankLoan());
        fs.setOtherLiabilities(dto.getOtherLiabilities());
        fs.setCapital(dto.getCapital());
        fs.setRetainedEarnings(dto.getRetainedEarnings());
        fs.setNotes(dto.getNotes());

        calculateFinancialSummary(fs);
        return financialStatementRepository.save(fs);
    }

    @Override
    public List<FinancialStatement> getByDateRange(LocalDate start, LocalDate end) {
        return financialStatementRepository.findByReportDateBetween(start, end);
    }


    private void calculateFinancialSummary(FinancialStatement fs) {

        // =========================
        // TOTAL ASSETS
        // =========================
        BigDecimal totalAssets =
                safe(fs.getReceivables())
                        .add(safe(fs.getCashAndCashEquivalent()))
                        .add(safe(fs.getInventory()))
                        .add(safe(fs.getPrepaidExpenses()))
                        .add(safe(fs.getLandBuilding()))
                        .add(safe(fs.getVehicles()))
                        .add(safe(fs.getFurniture()))
                        .add(safe(fs.getEquipment()))
                        .subtract(safe(fs.getAccumulatedDepreciation()));

        // =========================
        // TOTAL LIABILITIES
        // =========================
        BigDecimal totalLiabilities =
                safe(fs.getTradePayables())
                        .add(safe(fs.getDirectorCurrentAccount()))
                        .add(safe(fs.getBankLoan()))
                        .add(safe(fs.getOtherLiabilities()));

        // =========================
        // NET WORTH
        // =========================
        BigDecimal netWorth =
                totalAssets.subtract(totalLiabilities);

        // =========================
        // SET VALUES
        // =========================
        fs.setTotalAssets(totalAssets);
        fs.setTotalLiabilities(totalLiabilities);
        fs.setNetWorth(netWorth);
    }



    public FinancialDashboardDto getFinancialDashboard(String month) {

        FinancialStatement fs = financialStatementRepository
                .findByReportDate(LocalDate.parse(month + "-01"))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Financial statement not found"));

        FinancialDashboardDto dto = new FinancialDashboardDto();

        dto.setTotalIncome(safe(fs.getCapital()));
        dto.setTotalExpense(safe(fs.getRetainedEarnings()));
        dto.setNetProfit(
                safe(fs.getCapital()).subtract(safe(fs.getRetainedEarnings()))
        );

        dto.setTotalAssets(safe(fs.getTotalAssets()));
        dto.setTotalLiabilities(safe(fs.getTotalLiabilities()));
        dto.setNetWorth(safe(fs.getNetWorth()));

        return dto;
    }


    public List<MonthlyTrendDto> getMonthlyTrend(String month) {

        FinancialStatement fs = financialStatementRepository
                .findByReportDate(LocalDate.parse(month + "-01"))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Financial statement not found"));

        MonthlyTrendDto dto = new MonthlyTrendDto();

        BigDecimal income = safe(fs.getCapital());
        BigDecimal expense = safe(fs.getRetainedEarnings());

        dto.setMonth(month);
        dto.setIncome(income);
        dto.setExpense(expense);
        dto.setProfit(income.subtract(expense));

        return List.of(dto);
    }

    public ProfitLossDto getProfitLoss(String month) {

        FinancialStatement fs = financialStatementRepository
                .findByReportDate(LocalDate.parse(month + "-01"))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Financial statement not found"));

        BigDecimal income = safe(fs.getCapital());
        BigDecimal expense = safe(fs.getRetainedEarnings());

        BigDecimal netProfit = income.subtract(expense);

        BigDecimal profitMargin = BigDecimal.ZERO;

        if (income.compareTo(BigDecimal.ZERO) > 0) {

            profitMargin = netProfit
                    .divide(income, 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        ProfitLossDto dto = new ProfitLossDto();

        dto.setPeriod(month);
        dto.setTotalIncome(income);
        dto.setTotalExpense(expense);
        dto.setNetProfit(netProfit);
        dto.setProfitMargin(profitMargin);

        return dto;
    }
///////////////////////////////////////////////////////
public byte[] generateFinancialReportPdf(String month) {

    LocalDate reportDate = LocalDate.parse(month + "-01");

    FinancialStatement fs = financialStatementRepository
            .findByReportDate(reportDate)
            .orElseThrow(() ->
                    new ResourceNotFoundException("Financial statement not found for month: " + month));

    FinancialStatementDto dto =
            FinancialStatementMapper.toDto(fs);

    ByteArrayOutputStream out = new ByteArrayOutputStream();

    try {
        Document document = new Document();
        PdfWriter.getInstance(document, out);

        document.open();

        document.add(new Paragraph("FINANCIAL STATEMENT REPORT"));
        document.add(new Paragraph("Month: " + month));
        document.add(new Paragraph(" "));

        // ===== ASSETS =====
        document.add(new Paragraph("ASSETS"));
        document.add(new Paragraph("Cash & Cash Equivalent: " + dto.getCashAndCashEquivalent()));
        document.add(new Paragraph("Receivables: " + dto.getReceivables()));
        document.add(new Paragraph("Inventory: " + dto.getInventory()));
        document.add(new Paragraph("Prepaid Expenses: " + dto.getPrepaidExpenses()));
        document.add(new Paragraph("Land & Building: " + dto.getLandBuilding()));
        document.add(new Paragraph("Vehicles: " + dto.getVehicles()));
        document.add(new Paragraph("Furniture: " + dto.getFurniture()));
        document.add(new Paragraph("Equipment: " + dto.getEquipment()));
        document.add(new Paragraph("Accumulated Depreciation: " + dto.getAccumulatedDepreciation()));

        document.add(new Paragraph(" "));

        // ===== LIABILITIES =====
        document.add(new Paragraph("LIABILITIES"));
        document.add(new Paragraph("Trade Payables: " + dto.getTradePayables()));
        document.add(new Paragraph("Director Account: " + dto.getDirectorCurrentAccount()));
        document.add(new Paragraph("Bank Loan: " + dto.getBankLoan()));
        document.add(new Paragraph("Other Liabilities: " + dto.getOtherLiabilities()));

        document.add(new Paragraph(" "));

        // ===== EQUITY =====
        document.add(new Paragraph("EQUITY"));
        document.add(new Paragraph("Capital: " + dto.getCapital()));
        document.add(new Paragraph("Retained Earnings: " + dto.getRetainedEarnings()));

        document.add(new Paragraph(" "));

        document.add(new Paragraph("Notes: " + dto.getNotes()));

        document.close();

    } catch (Exception e) {
        throw new RuntimeException("Error generating PDF", e);
    }

    return out.toByteArray();
}



    public CashFlowDto getCashFlow(String month) {

        FinancialStatement fs = financialStatementRepository
                .findByReportDate(LocalDate.parse(month + "-01"))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Financial statement not found"));

        BigDecimal cashIn =
                safe(fs.getCashAndCashEquivalent())
                        .add(safe(fs.getReceivables()));

        BigDecimal cashOut =
                safe(fs.getTradePayables())
                        .add(safe(fs.getBankLoan()))
                        .add(safe(fs.getOtherLiabilities()));

        CashFlowDto dto = new CashFlowDto();

        dto.setPeriod(month);
        dto.setCashIn(cashIn);
        dto.setCashOut(cashOut);
        dto.setNetCashFlow(cashIn.subtract(cashOut));

        return dto;
    }

    public BalanceSheetDto getBalanceSheet(String month) {

        FinancialStatement fs = financialStatementRepository
                .findByReportDate(LocalDate.parse(month + "-01"))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Financial statement not found"));

        BalanceSheetDto dto = new BalanceSheetDto();

        dto.setPeriod(month);
        dto.setTotalAssets(safe(fs.getTotalAssets()));
        dto.setTotalLiabilities(safe(fs.getTotalLiabilities()));
        dto.setEquity(safe(fs.getNetWorth()));

        return dto;
    }

//    public FinancialReportDto getFinancialReport(String month) {
//
//        LocalDate reportDate = LocalDate.parse(month + "-01");
//
//        FinancialStatement fs = financialStatementRepository
//                .findByReportDate(reportDate)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException("Financial statement not found for month: " + month));
//
//        FinancialStatementDto dto =
//                FinancialStatementMapper.toDto(fs);
//
//        return FinancialReportDto.builder()
//                .period(month)
//                .totalAssets(dto.getCapital()) // adjust if needed
//                .build();
//    }


    public FinancialReportDto getFinancialReport(String month) {

        FinancialStatement fs = financialStatementRepository
                .findByReportDate(LocalDate.parse(month + "-01"))
                .orElseThrow(() ->
                        new ResourceNotFoundException("Financial statement not found for month: " + month));

        BigDecimal income = safe(fs.getCapital());
        BigDecimal expense = safe(fs.getRetainedEarnings());
        BigDecimal totalAssets = safe(fs.getTotalAssets());
        BigDecimal totalLiabilities = safe(fs.getTotalLiabilities());

        return FinancialReportDto.builder()
                .period(month)
                .totalIncome(income)
                .totalExpense(expense)
                .netProfit(income.subtract(expense))
                .totalAssets(totalAssets)
                .totalLiabilities(totalLiabilities)
                .equity(safe(fs.getNetWorth()))
                .cashIn(safe(fs.getCashAndCashEquivalent()).add(safe(fs.getReceivables())))
                .cashOut(safe(fs.getTradePayables()).add(safe(fs.getBankLoan())).add(safe(fs.getOtherLiabilities())))
                .netCashFlow(
                        safe(fs.getCashAndCashEquivalent()).add(safe(fs.getReceivables()))
                                .subtract(safe(fs.getTradePayables()).add(safe(fs.getBankLoan())).add(safe(fs.getOtherLiabilities())))
                )
                .build();
    }


    private List<FinancialStatement> getYearData(String year) {

        LocalDate start = LocalDate.parse(year + "-01-01");
        LocalDate end = LocalDate.parse(year + "-12-31");

        return financialStatementRepository
                .findByReportDateBetween(start, end);
    }

    @Override
    public FinancialReportDto getAnnualFinancialReport(String year) {

        List<FinancialStatement> list = getYearData(year);

        BigDecimal income = BigDecimal.ZERO;
        BigDecimal expense = BigDecimal.ZERO;

        BigDecimal assets = BigDecimal.ZERO;
        BigDecimal liabilities = BigDecimal.ZERO;

        BigDecimal cashIn = BigDecimal.ZERO;
        BigDecimal cashOut = BigDecimal.ZERO;

        for (FinancialStatement fs : list) {

            income = income.add(safe(fs.getCapital()));
            expense = expense.add(safe(fs.getRetainedEarnings()));

            BigDecimal asset =
                    safe(fs.getReceivables())
                            .add(safe(fs.getCashAndCashEquivalent()))
                            .add(safe(fs.getInventory()))
                            .add(safe(fs.getPrepaidExpenses()))
                            .add(safe(fs.getLandBuilding()))
                            .add(safe(fs.getVehicles()))
                            .add(safe(fs.getFurniture()))
                            .add(safe(fs.getEquipment()))
                            .subtract(safe(fs.getAccumulatedDepreciation()));

            BigDecimal liability =
                    safe(fs.getTradePayables())
                            .add(safe(fs.getDirectorCurrentAccount()))
                            .add(safe(fs.getBankLoan()))
                            .add(safe(fs.getOtherLiabilities()));

            assets = assets.add(asset);
            liabilities = liabilities.add(liability);

            cashIn = cashIn.add(safe(fs.getCashAndCashEquivalent()));
            cashOut = cashOut.add(safe(fs.getTradePayables()));
        }

        FinancialReportDto dto = new FinancialReportDto();

        dto.setPeriod(year);

        dto.setTotalIncome(income);
        dto.setTotalExpense(expense);
        dto.setNetProfit(income.subtract(expense));

        dto.setTotalAssets(assets);
        dto.setTotalLiabilities(liabilities);
        dto.setEquity(assets.subtract(liabilities));
     //   dto.setNetWorth(assets.subtract(liabilities));

        dto.setCashIn(cashIn);
        dto.setCashOut(cashOut);
        dto.setNetCashFlow(cashIn.subtract(cashOut));

        return dto;
    }

    @Override
    public BalanceSheetDto getAnnualBalanceSheet(String year) {

        List<FinancialStatement> list = getYearData(year);

        BigDecimal assets = BigDecimal.ZERO;
        BigDecimal liabilities = BigDecimal.ZERO;

        for (FinancialStatement fs : list) {

            BigDecimal asset =
                    safe(fs.getReceivables())
                            .add(safe(fs.getCashAndCashEquivalent()))
                            .add(safe(fs.getInventory()))
                            .add(safe(fs.getPrepaidExpenses()))
                            .add(safe(fs.getLandBuilding()))
                            .add(safe(fs.getVehicles()))
                            .add(safe(fs.getFurniture()))
                            .add(safe(fs.getEquipment()))
                            .subtract(safe(fs.getAccumulatedDepreciation()));

            BigDecimal liability =
                    safe(fs.getTradePayables())
                            .add(safe(fs.getDirectorCurrentAccount()))
                            .add(safe(fs.getBankLoan()))
                            .add(safe(fs.getOtherLiabilities()));

            assets = assets.add(asset);
            liabilities = liabilities.add(liability);
        }

        BalanceSheetDto dto = new BalanceSheetDto();

        dto.setPeriod(year);
        dto.setTotalAssets(assets);
        dto.setTotalLiabilities(liabilities);
        dto.setEquity(assets.subtract(liabilities));

        return dto;
    }

    @Override
    public CashFlowDto getAnnualCashFlow(String year) {

        List<FinancialStatement> list = getYearData(year);

        BigDecimal cashIn = BigDecimal.ZERO;
        BigDecimal cashOut = BigDecimal.ZERO;

        for (FinancialStatement fs : list) {

            cashIn = cashIn.add(
                    safe(fs.getCashAndCashEquivalent())
                            .add(safe(fs.getReceivables()))
            );

            cashOut = cashOut.add(
                    safe(fs.getTradePayables())
                            .add(safe(fs.getBankLoan()))
                            .add(safe(fs.getOtherLiabilities()))
            );
        }

        CashFlowDto dto = new CashFlowDto();

        dto.setPeriod(year);
        dto.setCashIn(cashIn);
        dto.setCashOut(cashOut);
        dto.setNetCashFlow(cashIn.subtract(cashOut));

        return dto;
    }

    @Override
    public String addFinancials(String username, FinancialRequestDto financialRequestDto) {
        try{
            Employee employee = employeeRepository.findByEmail(username);
            if(employee == null){
                throw new ResourceNotFoundException("Employee username not defined");
            }

            FinancialStatement financialStatement = FinancialStatementMapper.mapToFinancialStatement(financialRequestDto);

            financialStatementRepository.save(financialStatement);
            return "Successfully entered details";
        }catch (Exception e){
            return "Error entering details";
        }
    }


}


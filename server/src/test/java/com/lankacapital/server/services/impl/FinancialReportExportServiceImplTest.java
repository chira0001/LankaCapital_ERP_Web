package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAdministrativeExpenseDto;
import com.lankacapital.server.services.FinancialStatementService;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FinancialReportExportServiceImplTest {
    @Test
    void exportsCompleteStatementAsExcelWorkbook() throws Exception {
        FinancialStatementService reportService = (type, start, end) -> statementData(1, 1);
        FinancialReportExportServiceImpl exportService =
                new FinancialReportExportServiceImpl(reportService);

        byte[] bytes = exportService.export(
                "statement",
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2027, 3, 31)
        );

        String workbookXml = workbookXml(bytes);
        assertTrue(workbookXml.indexOf("<definedNames") < workbookXml.indexOf("<calcPr"));

        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertNotNull(workbook.getSheet("PPE"));
            assertEquals("Desk", workbook.getSheet("PPE").getRow(3).getCell(0).getStringCellValue());
            assertNotNull(workbook.getSheet("TB").getRow(4).getCell(0));
            assertNotNull(workbook.getSheet("Income Tax").getRow(34).getCell(0));
            assertTrue(((XSSFWorkbook) workbook).getCTWorkbook().getDefinedNames()
                    .getDefinedNameList().stream()
                    .anyMatch(name -> "Beg_Bal".equals(name.getName())));
            var working = workbook.getSheet("Working");
            int monthHeader = findRow(working, "EPF & ETF Month");
            assertTrue(findRow(working, "Assets") < monthHeader);
            assertTrue(findRow(working, "EPF ETF") < monthHeader);
            assertEquals("EPF20%", working.getRow(monthHeader).getCell(1).getStringCellValue());
            assertEquals("EPF12%", working.getRow(monthHeader).getCell(2).getStringCellValue());
            assertEquals("ETF3%", working.getRow(monthHeader).getCell(3).getStringCellValue());
            int firstMonth = monthHeader + 1;
            int lastMonth = firstMonth + 11;
            assertEquals(LocalDate.of(2026, 4, 1),
                    working.getRow(firstMonth).getCell(0).getLocalDateTimeCellValue().toLocalDate());
            assertEquals(LocalDate.of(2027, 3, 1),
                    working.getRow(lastMonth).getCell(0).getLocalDateTimeCellValue().toLocalDate());
            assertEquals(1000, working.getRow(firstMonth).getCell(1).getNumericCellValue());
            assertEquals(12000, working.getRow(lastMonth).getCell(1).getNumericCellValue());
            assertEquals("B" + (firstMonth + 1) + "*12/20",
                    working.getRow(firstMonth).getCell(2).getCellFormula());
            assertEquals("C" + (lastMonth + 1) + "*3/12",
                    working.getRow(lastMonth).getCell(3).getCellFormula());
            int totalRow = findRow(workbook.getSheet("TB"), "Total");
            assertEquals("B" + (totalRow + 1) + "-C" + (totalRow + 1),
                    workbook.getSheet("TB").getRow(totalRow + 1).getCell(1).getCellFormula());
        }
    }

    @Test
    void expandsTrialBalanceForAdditionalAccounts() throws Exception {
        FinancialStatementService reportService = (type, start, end) -> statementData(30, 1);
        FinancialReportExportServiceImpl exportService =
                new FinancialReportExportServiceImpl(reportService);

        byte[] bytes = exportService.export(
                "statement",
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2027, 3, 31)
        );

        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheet("TB");
            int totalRow = findRow(sheet, "Total");
            int lastAccountRow = findRow(sheet, "Cash 29");
            assertTrue(lastAccountRow < totalRow);
            assertEquals("SUM(B5:B" + totalRow + ")", sheet.getRow(totalRow).getCell(1).getCellFormula());
        }
    }

    @Test
    void includesEveryAdministrativeExpenseBeforeFollowingWorkingSections() throws Exception {
        List<WorkingAdministrativeExpenseDto> expenses = List.of(
                expense("Advertisment & Sales Promotion", 99975),
                expense("Bad Debts", 163480),
                expense("Commission", 11000),
                expense("Salaries & Wages", 900750),
                expense("EPF & Etf", 16522),
                expense("Rent", 171150),
                expense("Maintance & Repair", 71672.50),
                expense("Electricity", 13070),
                expense("Phone & Internet bills", 45597),
                expense("Company Incorporation fees", 60000),
                expense("Insurance", 10500),
                expense("Stationery & Documents", 94812)
        );
        FinancialStatementService reportService = (type, start, end) ->
                statementData(1, 1, expenses);
        FinancialReportExportServiceImpl exportService =
                new FinancialReportExportServiceImpl(reportService);

        byte[] bytes = exportService.export(
                "statement",
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2027, 3, 31)
        );

        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheet("Working");
            int adminHeader = findRow(sheet, "Administrative Expenses");
            for (int i = 0; i < expenses.size(); i++) {
                var row = sheet.getRow(adminHeader + i + 1);
                assertEquals(expenses.get(i).getAdminExpenseName(), row.getCell(0).getStringCellValue(),
                        "Unexpected category at worksheet row " + (adminHeader + i + 2));
                assertEquals(expenses.get(i).getAdminExpenseAmount().doubleValue(),
                        row.getCell(1).getNumericCellValue());
            }
            assertTrue(findRow(sheet, "Assets") > adminHeader + expenses.size());
            assertTrue(findRow(sheet, "EPF & ETF Month") > findRow(sheet, "Assets"));
        }
    }

    @Test
    void compactsPpeRowsWhenReportHasNoAssets() throws Exception {
        FinancialStatementService reportService = (type, start, end) -> statementData(1, 0);
        FinancialReportExportServiceImpl exportService =
                new FinancialReportExportServiceImpl(reportService);

        byte[] bytes = exportService.export(
                "statement",
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2027, 3, 31)
        );

        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheet("PPE");
            assertEquals(3, findRow(sheet, "Total"));
            assertEquals("0", sheet.getRow(3).getCell(3).getCellFormula());
            assertEquals(CellType.BLANK, sheet.getRow(3).getCell(5).getCellType());
            assertEquals("0", sheet.getRow(3).getCell(6).getCellFormula());
        }
    }

    private static int findRow(org.apache.poi.ss.usermodel.Sheet sheet, String value) {
        for (int row = 0; row <= sheet.getLastRowNum(); row++) {
            var current = sheet.getRow(row);
            if (current != null && current.getCell(0) != null
                    && value.equals(current.getCell(0).getStringCellValue())) return row;
        }
        throw new AssertionError("Could not find row: " + value);
    }

    private static String workbookXml(byte[] bytes) throws IOException {
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if ("xl/workbook.xml".equals(entry.getName())) {
                    return new String(zip.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                }
            }
        }
        throw new AssertionError("Workbook XML not found");
    }

    private static HashMap<String, Object> statementData(int bankAccountCount, int ppeCount) {
        return statementData(bankAccountCount, ppeCount,
                List.of(expense("Office Rent", 500)));
    }

    private static HashMap<String, Object> statementData(
            int bankAccountCount,
            int ppeCount,
            List<?> expenses
    ) {
        HashMap<String, Object> result = new HashMap<>();
        List<Map<String, Object>> bankAccounts = IntStream.range(0, bankAccountCount)
                .mapToObj(index -> Map.<String, Object>of(
                        "accountName", "Cash " + index,
                        "amount", 100,
                        "transactionType", "DR"
                ))
                .toList();
        Map<String, Object> ppe = Map.of(
                "asset", "Desk",
                "monthOfPurchased", "2026-04-03",
                "monthStartingDepreciation", "2027-03-12",
                "rate", 5,
                "amount", 1000,
                "date", 343,
                "depreciationAmount", 18.79
        );
        result.put("ppe", IntStream.range(0, ppeCount).mapToObj(index -> ppe).toList());
        result.put("working", Map.of(
                "interestIncome", 1000,
                "workingAdministrativeExpenseDtos", expenses,
                "workingAssetsDtos", List.of(
                        Map.of("assetName", "Desk", "assetAmount", 1000)
                ),
                "workingEPFETFDtos", IntStream.range(0, 12)
                        .mapToObj(index -> Map.of(
                                "date", YearMonth.of(2026, 4).plusMonths(index).toString(),
                                "epf20", (index + 1) * 1000
                        ))
                        .toList()
        ));
        result.put("tb", Map.of(
                "bankAccounts", bankAccounts,
                "assets", List.of(),
                "liabilities", List.of(),
                "equity", List.of(Map.of("accountName", "Share capital", "amount", 100, "transactionType", "CR")),
                "income", List.of(Map.of("accountName", "Interest Income", "amount", 1000, "transactionType", "CR")),
                "expenses", List.of(Map.of("accountName", "Bad Debts", "amount", 50, "transactionType", "DR"))
        ));
        result.put("p10", Map.of(
                "balanceAtDate", "2026-04-01",
                "costValue", List.of(Map.of("Desk", 1000)),
                "depreciationValue", List.of(Map.of("Desk", 100))
        ));
        result.put("p11", Map.of("numberOfShares", 100));
        result.put("ce", Map.of(
                "statedCapitalBalance", Map.of("Balance as at", 100),
                "retainedEarningBalance", Map.of("Balance as at", 20),
                "retainedEarningShares", Map.of("Shares Issued", 10),
                "statedCapitalPL", Map.of("Profit or Loss for the Period", 50)
        ));
        result.put("cf", Map.of("openingCashBalance", 20, "cashInHandAmount", 100));
        result.put("incomeTax", Map.of(
                "assetYear", List.of(Map.of("Desk", 5)),
                "balanceBF", Map.of("2026-04-01", 0),
                "withholdingPayments", 0,
                "investmentIncome", 0,
                "businessIncome", 100
        ));
        result.put("p09", Map.of());
        return result;
    }

    private static WorkingAdministrativeExpenseDto expense(String name, double amount) {
        return new WorkingAdministrativeExpenseDto(name, BigDecimal.valueOf(amount));
    }
}

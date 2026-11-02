package com.lankacapital.server.services.impl;

import com.lankacapital.server.services.FinancialStatementService;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
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
        FinancialStatementService reportService = (type, start, end) -> statementData(1);
        FinancialReportExportServiceImpl exportService =
                new FinancialReportExportServiceImpl(reportService);

        byte[] bytes = exportService.export(
                "statement",
                LocalDate.of(2024, 4, 1),
                LocalDate.of(2025, 3, 31)
        );

        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertNotNull(workbook.getSheet("PPE"));
            assertEquals("Desk", workbook.getSheet("PPE").getRow(3).getCell(0).getStringCellValue());
            assertNotNull(workbook.getSheet("TB").getRow(4).getCell(0));
            assertNotNull(workbook.getSheet("Income Tax").getRow(34).getCell(0));
            int totalRow = findRow(workbook.getSheet("TB"), "Total");
            assertEquals("B" + (totalRow + 1) + "-C" + (totalRow + 1),
                    workbook.getSheet("TB").getRow(totalRow + 1).getCell(1).getCellFormula());
        }
    }

    @Test
    void expandsTrialBalanceForAdditionalAccounts() throws Exception {
        FinancialStatementService reportService = (type, start, end) -> statementData(30);
        FinancialReportExportServiceImpl exportService =
                new FinancialReportExportServiceImpl(reportService);

        byte[] bytes = exportService.export(
                "statement",
                LocalDate.of(2024, 4, 1),
                LocalDate.of(2025, 3, 31)
        );

        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            var sheet = workbook.getSheet("TB");
            int totalRow = findRow(sheet, "Total");
            int lastAccountRow = findRow(sheet, "Cash 29");
            assertTrue(lastAccountRow < totalRow);
            assertEquals("SUM(B5:B" + totalRow + ")", sheet.getRow(totalRow).getCell(1).getCellFormula());
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

    private static HashMap<String, Object> statementData(int bankAccountCount) {
        HashMap<String, Object> result = new HashMap<>();
        List<Map<String, Object>> bankAccounts = IntStream.range(0, bankAccountCount)
                .mapToObj(index -> Map.<String, Object>of(
                        "accountName", "Cash " + index,
                        "amount", 100,
                        "transactionType", "DR"
                ))
                .toList();
        result.put("ppe", List.of(Map.of(
                "asset", "Desk",
                "monthOfPurchased", "2024-04-03",
                "monthStartingDepreciation", "2025-03-12",
                "rate", 5,
                "amount", 1000,
                "date", 343,
                "depreciationAmount", 18.79
        )));
        result.put("working", Map.of(
                "interestIncome", 1000,
                "workingAdministrativeExpenseDtos", List.of(
                        Map.of("adminExpenseName", "Office Rent", "adminExpenseAmount", 500)
                ),
                "workingAssetsDtos", List.of(
                        Map.of("assetName", "Desk", "assetAmount", 1000)
                ),
                "workingEPFETFDtos", List.of(
                        Map.of("date", "2025-03-01", "epf20", 100, "epf12", 60, "etf3", 15)
                )
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
                "balanceAtDate", "2024-04-01",
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
                "balanceBF", Map.of("2024-04-01", 0),
                "withholdingPayments", 0,
                "investmentIncome", 0,
                "businessIncome", 100
        ));
        result.put("p09", Map.of());
        return result;
    }
}

package com.lankacapital.server.services.impl;

import com.lankacapital.server.services.FinancialReportExportService;
import com.lankacapital.server.services.FinancialStatementService;
import lombok.AllArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellReference;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.beans.Introspector;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
@AllArgsConstructor
public class FinancialReportExportServiceImpl implements FinancialReportExportService {
    private static final String TEMPLATE_PATH = "templates/Audited Accounts 2425.xlsx";
    private static final List<Map.Entry<String, String>> TB_SECTIONS = List.of(
            Map.entry("BankAccounts", "Bank accounts"),
            Map.entry("Assets", "Assets"),
            Map.entry("Liabilities", "Liabilities"),
            Map.entry("Equity", "Equity"),
            Map.entry("Income", "Income"),
            Map.entry("Expenses", "Expenses")
    );

    private final FinancialStatementService financialStatementService;

    @Override
    public byte[] export(String reportType, LocalDate startDate, LocalDate endDate) throws IOException {
        Map<String, Object> data = financialStatementService.generateReports(
                reportType, startDate.toString(), endDate.toString());
        if ("p11".equalsIgnoreCase(reportType)) {
            data.putAll(financialStatementService.generateReports(
                    "tb", startDate.toString(), endDate.toString()));
        } else if ("p09".equalsIgnoreCase(reportType)) {
            data.put("p09", Map.of());
            data.putAll(financialStatementService.generateReports(
                    "tb", startDate.toString(), endDate.toString()));
        } else if ("statement".equalsIgnoreCase(reportType)) {
            data.putIfAbsent("p09", Map.of());
        }
        if (data.containsKey("tb") && !data.containsKey("working")) {
            data.putAll(financialStatementService.generateReports(
                    "working", startDate.toString(), endDate.toString()));
        }

        byte[] templateBytes;
        try (InputStream template = new ClassPathResource(TEMPLATE_PATH).getInputStream()) {
            templateBytes = template.readAllBytes();
        }

        try (Workbook workbook = WorkbookFactory.create(new ByteArrayInputStream(templateBytes));
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            removeDefinedNamesForRowShifts(workbook);
            fillWorkbook(workbook, data, endDate);
            workbook.setForceFormulaRecalculation(true);
            workbook.write(output);
            return restoreDefinedNames(templateBytes, output.toByteArray());
        }
    }

    private static void removeDefinedNamesForRowShifts(Workbook workbook) {
        new ArrayList<>(workbook.getAllNames()).forEach(workbook::removeName);
    }

    private static byte[] restoreDefinedNames(byte[] templateBytes, byte[] outputBytes) throws IOException {
        String templateXml = zipEntryText(templateBytes, "xl/workbook.xml");
        String definedNames = extractDefinedNames(templateXml);
        if (definedNames == null) return outputBytes;

        String outputXml = zipEntryText(outputBytes, "xl/workbook.xml");
        String updatedXml;
        int namesStart = outputXml.indexOf("<definedNames");
        if (namesStart >= 0) {
            int namesEnd = outputXml.indexOf("</definedNames>", namesStart);
            if (namesEnd < 0) throw new IOException("Malformed workbook defined names section");
            updatedXml = outputXml.substring(0, namesStart)
                    + definedNames
                    + outputXml.substring(namesEnd + "</definedNames>".length());
        } else {
            int insertionPoint = outputXml.indexOf("<calcPr");
            if (insertionPoint < 0) insertionPoint = outputXml.lastIndexOf("</workbook>");
            if (insertionPoint < 0) throw new IOException("Malformed workbook XML");
            updatedXml = outputXml.substring(0, insertionPoint)
                    + definedNames
                    + outputXml.substring(insertionPoint);
        }

        ByteArrayOutputStream restored = new ByteArrayOutputStream();
        try (ZipInputStream input = new ZipInputStream(new ByteArrayInputStream(outputBytes));
             ZipOutputStream zip = new ZipOutputStream(restored)) {
            ZipEntry entry;
            while ((entry = input.getNextEntry()) != null) {
                ZipEntry copy = new ZipEntry(entry.getName());
                copy.setTime(entry.getTime());
                zip.putNextEntry(copy);
                if ("xl/workbook.xml".equals(entry.getName())) {
                    zip.write(updatedXml.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                } else {
                    input.transferTo(zip);
                }
                zip.closeEntry();
                input.closeEntry();
            }
        }
        return restored.toByteArray();
    }

    private static String zipEntryText(byte[] archive, String entryName) throws IOException {
        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(archive))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                if (entryName.equals(entry.getName())) {
                    return new String(zip.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                }
            }
        }
        throw new IOException("Workbook is missing " + entryName);
    }

    private static String extractDefinedNames(String workbookXml) throws IOException {
        int start = workbookXml.indexOf("<definedNames");
        if (start < 0) return null;
        int end = workbookXml.indexOf("</definedNames>", start);
        if (end < 0) throw new IOException("Malformed template defined names section");
        return workbookXml.substring(start, end + "</definedNames>".length());
    }

    private void fillWorkbook(Workbook workbook, Map<String, Object> data, LocalDate endDate) {
        if (data.get("ppe") instanceof List<?> ppe) fillPpe(workbook, ppe);
        if (data.get("working") != null) fillWorking(workbook, map(data.get("working")));
        if (data.get("tb") != null) {
            fillTrialBalance(workbook, map(data.get("tb")), list(data.get("ppe")), data.get("working"));
        }
        if (data.get("p10") != null) fillP10(workbook, map(data.get("p10")), endDate);
        if (data.get("p11") != null) fillP11(workbook, map(data.get("p11")), endDate);
        if (data.get("ce") != null) fillEquity(workbook, map(data.get("ce")), endDate);
        if (data.get("cf") != null) fillCashFlow(workbook, map(data.get("cf")));
        if (data.get("incomeTax") != null) fillIncomeTax(workbook, map(data.get("incomeTax")), endDate);
        fillPeriodHeaders(workbook, endDate);
        if (data.get("tb") != null) fillP09(workbook);
        if (data.get("cf") != null) updateCashFlowReferences(workbook);
    }

    private void fillPpe(Workbook workbook, List<?> rows) {
        Sheet sheet = requiredSheet(workbook, "PPE");
        int header = findRow(sheet, "Asset", 0);
        if (header < 0) throw new IllegalStateException("PPE sheet is missing the Asset header");
        int start = header + 1;
        int total = findRow(sheet, "Total", 0);
        if (total < 0) total = start + 1;
        int template = start;
        int oldRows = Math.max(total - start, 1);
        resizeBefore(sheet, total, oldRows, rows.size(), 6);
        int newTotal = total + rows.size() - oldRows;
        for (int i = 0; i < rows.size(); i++) {
            int row = start + i;
            copyRowStyle(sheet, template, row, 6);
            Map<String, Object> item = map(rows.get(i));
            setText(sheet, row, 0, text(item.get("asset")));
            setDate(sheet, row, 1, item.get("monthOfPurchased"), "mmm-yy");
            setNumber(sheet, row, 2, number(item.get("rate")));
            setNumber(sheet, row, 3, number(item.get("amount")));
            setDate(sheet, row, 4, item.get("monthStartingDepreciation"), "mmm-yy");
            setFormula(sheet, row, 5, "E" + (row + 1) + "-B" + (row + 1));
            setFormula(sheet, row, 6, "(D" + (row + 1) + "/C" + (row + 1) + ")*(F" + (row + 1) + "/365)");
        }
        for (int column = 0; column <= 6; column++) clearCell(sheet, newTotal, column);
        setText(sheet, newTotal, 0, "Total");
        setFormula(sheet, newTotal, 3, rows.isEmpty() ? "0" : "SUM(D" + (start + 1) + ":D" + (start + rows.size()) + ")");
        setFormula(sheet, newTotal, 6, rows.isEmpty() ? "0" : "SUM(G" + (start + 1) + ":G" + (start + rows.size()) + ")");
    }

    private void fillWorking(Workbook workbook, Map<String, Object> working) {
        Sheet sheet = requiredSheet(workbook, "Working");
        int income = findRow(sheet, "Interest Income", 0);
        if (income >= 0) setNumber(sheet, income, 1, number(working.get("interestIncome")));

        List<?> expenses = list(working.get("workingAdministrativeExpenseDtos"));
        int adminHeader = findRow(sheet, "Administrative Expenses", 0);
        int assetsHeader = findRow(sheet, "Assets", 0);
        int adminFirst = adminHeader + 1;
        resizeSection(sheet, adminFirst, assetsHeader, expenses.size(), 1);
        assetsHeader = findRow(sheet, "Assets", 0);
        for (int i = 0; i < expenses.size(); i++) {
            Map<String, Object> item = map(expenses.get(i));
            int row = adminFirst + i;
            setText(sheet, row, 0, text(item.get("adminExpenseName")));
            setNumber(sheet, row, 1, number(item.get("adminExpenseAmount")));
        }

        List<?> assets = list(working.get("workingAssetsDtos"));
        assetsHeader = findRow(sheet, "Assets", 0);
        int epfHeader = findRow(sheet, "EPF ETF", 0);
        int assetFirst = assetsHeader + 1;
        resizeSection(sheet, assetFirst, epfHeader, assets.size(), 2);
        epfHeader = findRow(sheet, "EPF ETF", 0);
        for (int i = 0; i < assets.size(); i++) {
            Map<String, Object> item = map(assets.get(i));
            setText(sheet, assetFirst + i, 0, text(item.get("assetName")));
            setNumber(sheet, assetFirst + i, 1, number(item.get("assetAmount")));
        }

        List<?> epf = list(working.get("workingEPFETFDtos"));
        epfHeader = findRow(sheet, "EPF ETF", 0);
        if (epfHeader < 0) throw new IllegalStateException("Working sheet is missing the EPF ETF section");
        int epfLabel = epfHeader + 1;
        int total = findRow(sheet, "Total", 0);
        int epfFirst = epfLabel + 1;
        resizeBefore(sheet, total, total - epfFirst, epf.size(), 3);
        total = findRow(sheet, "Total", 0);
        for (int i = 0; i < epf.size(); i++) {
            Map<String, Object> item = map(epf.get(i));
            int row = epfFirst + i;
            setDate(sheet, row, 0, item.get("date"), "mmm yyyy");
            setNumber(sheet, row, 1, number(item.getOrDefault("epf20", item.get("EPF20"))));
            setFormula(sheet, row, 2, "B" + (row + 1) + "*12/20");
            setFormula(sheet, row, 3, "C" + (row + 1) + "*3/12");
        }
        setFormula(sheet, total, 1, epf.isEmpty() ? "0" : "SUM(B" + (epfFirst + 1) + ":B" + (epfFirst + epf.size()) + ")");
        setFormula(sheet, total, 2, epf.isEmpty() ? "0" : "SUM(C" + (epfFirst + 1) + ":C" + (epfFirst + epf.size()) + ")");
        setFormula(sheet, total, 3, epf.isEmpty() ? "0" : "SUM(D" + (epfFirst + 1) + ":D" + (epfFirst + epf.size()) + ")");
        setText(sheet, epfLabel, 0, "EPF & ETF Month");
    }

    private void fillTrialBalance(
            Workbook workbook,
            Map<String, Object> tb,
            List<?> ppeRows,
            Object workingData
    ) {
        Sheet sheet = requiredSheet(workbook, "TB");
        int header = findRow(sheet, "Accounts", 0);
        int total = findRow(sheet, "Total", 0);
        if (header < 0 || total < 0) throw new IllegalStateException("TB sheet layout is missing Accounts or Total");
        int first = header + 1;
        CellStyle[] totalStyle = rowStyles(sheet.getRow(total), 2);
        CellStyle[] differenceStyle = rowStyles(sheet.getRow(total + 1), 2);
        Map<String, CellStyle[]> sectionStyles = new HashMap<>();
        Map<String, CellStyle[]> itemStyles = new HashMap<>();
        for (Map.Entry<String, String> section : TB_SECTIONS) {
            int sectionRow = findRow(sheet, section.getValue(), 0);
            if (sectionRow >= 0) {
                sectionStyles.put(section.getKey(), rowStyles(sheet.getRow(sectionRow), 2));
                itemStyles.put(section.getKey(), rowStyles(sheet.getRow(sectionRow + 1), 2));
            }
        }

        Map<String, List<Map<String, Object>>> sections = normalizeTrialBalance(tb);
        List<Map<String, Object>> existingAssetRows = new ArrayList<>(sections.get("Assets"));
        sections.get("Assets").clear();
        Set<String> ppeNames = new HashSet<>();
        int ppeStartRow = findRow(requiredSheet(workbook, "PPE"), "Asset", 0) + 1;
        int ppeTotalRow = ppeStartRow + Math.max(ppeRows.size(), 1);
        for (int i = 0; i < ppeRows.size(); i++) {
            Map<String, Object> ppe = map(ppeRows.get(i));
            String name = text(ppe.getOrDefault("asset", ppe.get("assetName"))).trim();
            if (name.isEmpty()) continue;
            ppeNames.add(name.toLowerCase(Locale.ROOT));
            Map<String, Object> row = new HashMap<>();
            row.put("accountName", name);
            row.put("drFormula", "'PPE'!D" + (ppeStartRow + i + 1));
            row.put("drFallback", number(ppe.get("amount")));
            row.put("cr", 0d);
            sections.get("Assets").add(row);
        }
        if (!ppeRows.isEmpty()) {
            Map<String, Object> depreciation = new HashMap<>();
            depreciation.put("accountName", "Accumalated Deprecion");
            depreciation.put("crFormula", "'PPE'!G" + (ppeTotalRow + 1));
            depreciation.put("crFallback", ppeRows.stream().map(this::map)
                    .mapToDouble(item -> number(item.get("depreciationAmount"))).sum());
            depreciation.put("dr", 0d);
            sections.get("Assets").add(depreciation);
        }
        existingAssetRows.stream()
                .filter(item -> !ppeNames.contains(
                        text(item.get("accountName")).trim().toLowerCase(Locale.ROOT)))
                .forEach(sections.get("Assets")::add);
        int receivables = -1;
        for (int i = 0; i < sections.get("Assets").size(); i++) {
            if ("Receivables".equalsIgnoreCase(
                    text(sections.get("Assets").get(i).get("accountName")).trim())) {
                receivables = i;
                break;
            }
        }
        Map<String, Object> receivablesHeader = new HashMap<>();
        receivablesHeader.put("accountName", "Receivables");
        receivablesHeader.put("sectionHeader", true);
        int incomeInsertIndex;
        if (receivables >= 0) {
            Map<String, Object> receivablesBalance = new HashMap<>(sections.get("Assets").get(receivables));
            receivablesBalance.put("accountName", "Receivables balance");
            sections.get("Assets").set(receivables, receivablesHeader);
            sections.get("Assets").add(receivables + 1, receivablesBalance);
            incomeInsertIndex = receivables + 2;
        } else {
            incomeInsertIndex = sections.get("Assets").size() + 1;
            sections.get("Assets").add(sections.get("Assets").size(), receivablesHeader);
        }
        Map<String, Object> income = new HashMap<>();
        income.put("accountName", "Income");
        income.put("dr", 0d);
        income.put("crFormula", "'Working'!B2");
        sections.get("Assets").add(incomeInsertIndex, income);

        int desired = TB_SECTIONS.stream()
                .filter(section -> !"Income".equals(section.getKey()))
                .mapToInt(section -> 1 + sections.get(section.getKey()).size())
                .sum();
        int delta = desired - (total - first);
        if (delta > 0) shiftRows(sheet, total, delta);
        else if (delta < 0) {
            clearRows(sheet, first + desired, total - 1);
            shiftRows(sheet, total, delta);
            total += delta;
        }
        int row = first;
        for (Map.Entry<String, String> section : TB_SECTIONS) {
            if ("Income".equals(section.getKey())) continue;
            applyRowStyles(sheet, row, sectionStyles.get(section.getKey()), 2);
            setText(sheet, row, 0, "Expenses".equals(section.getKey())
                    ? "Administrative Expenses"
                    : section.getValue());
            clearCell(sheet, row, 1);
            clearCell(sheet, row, 2);
            if ("BankAccounts".equals(section.getKey())) unboldRow(sheet, row, 2);
            else boldRow(sheet, row, 2);
            row++;
            for (Map<String, Object> item : sections.get(section.getKey())) {
                applyRowStyles(sheet, row, itemStyles.get(section.getKey()), 2);
                String accountName = text(item.get("accountName"));
                setText(sheet, row, 0, accountName);
                if (Boolean.TRUE.equals(item.get("sectionHeader"))) {
                    clearCell(sheet, row, 1);
                    clearCell(sheet, row, 2);
                    boldRow(sheet, row, 2);
                    row++;
                    continue;
                }
                Object formula = item.get("drFormula");
                if (formula != null) {
                    setFormula(sheet, row, 1, text(formula));
                } else {
                    int workingExpenseRow = "Expenses".equals(section.getKey())
                            ? findWorkingExpenseRow(workbook, workingData, accountName)
                            : -1;
                    if (workingExpenseRow >= 0) setFormula(sheet, row, 1, "'Working'!B" + (workingExpenseRow + 1));
                    else setNumber(sheet, row, 1, number(item.getOrDefault("dr", item.get("drFallback"))));
                }
                formula = item.get("crFormula");
                if (formula != null) setFormula(sheet, row, 2, text(formula));
                else setNumber(sheet, row, 2, number(item.getOrDefault("cr", item.get("crFallback"))));
                if ("Assets".equals(section.getKey())
                        && !"Accumalated Deprecion".equalsIgnoreCase(accountName.trim())
                        && !"Income".equalsIgnoreCase(accountName.trim())) {
                    clearCell(sheet, row, 2);
                }
                row++;
            }
        }
        applyRowStyles(sheet, row, totalStyle, 2);
        setText(sheet, row, 0, "Total");
        setFormula(sheet, row, 1, "SUM(B" + (first + 1) + ":B" + row + ")");
        setFormula(sheet, row, 2, "SUM(C" + (first + 1) + ":C" + row + ")");
        boldRow(sheet, row, 2);
        applyRowStyles(sheet, row + 1, differenceStyle, 2);
        setFormula(sheet, row + 1, 1, "B" + (row + 1) + "-C" + (row + 1));
    }

    private int findWorkingExpenseRow(Workbook workbook, Object workingData, String expenseName) {
        if (workingData == null) return -1;
        List<?> expenses = list(map(workingData).get("workingAdministrativeExpenseDtos"));
        Sheet workingSheet = requiredSheet(workbook, "Working");
        int adminHeader = findRow(workingSheet, "Administrative Expenses", 0);
        if (adminHeader < 0) return -1;
        for (int i = 0; i < expenses.size(); i++) {
            Map<String, Object> expense = map(expenses.get(i));
            if (expenseName.equalsIgnoreCase(text(expense.get("adminExpenseName")).trim())) {
                return adminHeader + i + 1;
            }
        }
        return -1;
    }

    private void fillP10(Workbook workbook, Map<String, Object> p10, LocalDate endDate) {
        Sheet sheet = requiredSheet(workbook, "P10");
        Sheet tb = requiredSheet(workbook, "TB");
        List<Map<String, Object>> cost = entries(p10.get("costValue"));
        List<Map<String, Object>> depreciation = entries(p10.get("depreciationValue"));
        List<Integer> tbAssetRows = new ArrayList<>();
        for (int row = 0; row <= tb.getLastRowNum(); row++) {
            Row tbRow = tb.getRow(row);
            Cell amountCell = tbRow == null ? null : tbRow.getCell(1);
            if (amountCell != null && amountCell.getCellType() == CellType.FORMULA
                    && amountCell.getCellFormula().startsWith("'PPE'!D")) {
                tbAssetRows.add(row);
            }
        }
        int count = Math.max(1, tbAssetRows.isEmpty()
                ? Math.max(cost.size(), depreciation.size())
                : tbAssetRows.size());
        int costLabel = findRow(sheet, "Furniture & Fittings", 1);
        int depHeader = findRow(sheet, "Accumulated Depreciation", 1);
        int wdvHeader = findRow(sheet, "Written Down Value", 1);
        if (costLabel < 0 || depHeader < 0 || wdvHeader < 0) throw new IllegalStateException("P10 sheet sections are missing");
        int costFirst = costLabel;
        int costTotal = costFirst + 1;
        resizeBefore(sheet, costTotal, 1, count, 9);
        costTotal = costFirst + count;
        depHeader = findRow(sheet, "Accumulated Depreciation", 1);
        int depFirst = depHeader + 1;
        int depTotal = depFirst + 1;
        resizeBefore(sheet, depTotal, 1, count, 9);
        depTotal = depFirst + count;
        wdvHeader = findRow(sheet, "Written Down Value", 1);
        int wdvFirst = wdvHeader + 1;
        int wdvTotal = wdvFirst + 1;
        resizeBefore(sheet, wdvTotal, 1, count, 9);
        wdvTotal = wdvFirst + count;

        setText(sheet, costFirst - 1, 4, "Balance at " + date(p10.get("balanceAtDate"), "dd.MM.yyyy"));
        setText(sheet, costFirst - 1, 9, "Balance at " + endDate.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
        setText(sheet, depFirst - 1, 4, "Balance at " + date(p10.get("balanceAtDate"), "dd.MM.yyyy"));
        setText(sheet, depFirst - 1, 9, "Balance at " + endDate.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
        setText(sheet, wdvFirst - 1, 9, "Balance as at\r\n " + endDate.format(DateTimeFormatter.ofPattern("dd.MM.yyyy")));
        for (int i = 0; i < count; i++) {
            Map<String, Object> c = i < cost.size() ? cost.get(i) : Map.of();
            Map<String, Object> d = i < depreciation.size() ? depreciation.get(i) : Map.of();
            int cr = costFirst + i;
            int dr = depFirst + i;
            int wr = wdvFirst + i;
            String name = text(c.getOrDefault("name", d.get("name")));
            if (!tbAssetRows.isEmpty()) {
                int tbAssetRow = tbAssetRows.get(i);
                setFormula(sheet, cr, 1, "'TB'!A" + (tbAssetRow + 1));
                setFormula(sheet, cr, 6, "'TB'!B" + (tbAssetRow + 1));
            } else {
                setText(sheet, cr, 1, name);
                setFormula(sheet, cr, 6, "PPE!D" + (i + 4));
            }
            setNumber(sheet, cr, 4, number(c.get("value")));
            setFormula(sheet, dr, 1, "B" + (cr + 1));
            setNumber(sheet, dr, 4, number(d.get("value")));
            setFormula(sheet, dr, 6, "PPE!G" + (i + 4));
            setFormula(sheet, wr, 1, "B" + (dr + 1));
            setFormula(sheet, wr, 9, "J" + (cr + 1) + "-J" + (dr + 1));
        }
        setFormula(sheet, costTotal, 4, "SUM(E" + (costFirst + 1) + ":E" + costTotal + ")");
        setFormula(sheet, costTotal, 6, "SUM(G" + (costFirst + 1) + ":G" + costTotal + ")");
        setFormula(sheet, costTotal, 9, "SUM(J" + (costFirst + 1) + ":J" + costTotal + ")");
        setFormula(sheet, depTotal, 4, "SUM(E" + (depFirst + 1) + ":E" + depTotal + ")");
        setFormula(sheet, depTotal, 6, "SUM(G" + (depFirst + 1) + ":G" + depTotal + ")");
        setFormula(sheet, depTotal, 9, "SUM(J" + (depFirst + 1) + ":J" + depTotal + ")");
        setFormula(sheet, wdvTotal, 9, "SUM(J" + (wdvFirst + 1) + ":J" + wdvTotal + ")");
    }

    private void fillP09(Workbook workbook) {
        Sheet sheet = requiredSheet(workbook, "P09");
        int incomeRow = findRow(sheet, "Commission Income", 1);
        int tbIncomeRow = findRow(requiredSheet(workbook, "TB"), "Income", 0);
        if (incomeRow >= 0 && tbIncomeRow >= 0) {
            setFormula(sheet, incomeRow, 3, "'TB'!C" + (tbIncomeRow + 1));
        }
        int adminHeader = findRow(sheet, "Administration Expenses", 1);
        int financeHeader = findRow(sheet, "Finance Cost", 1);
        if (adminHeader < 0 || financeHeader < 0) throw new IllegalStateException("P09 sheet sections are missing");
        List<String[]> rows = List.of(
                new String[]{"Director Remuniration", "Dirtectors remuniration", "Directors remuneration"},
                new String[]{"Salaries & Wages", "Salaries & Wages"},
                new String[]{"EPF", "EPF"},
                new String[]{"ETF", "ETF"},
                new String[]{"Incorporation Fee", "Company Incorporation fees", "Incorporation Fees"},
                new String[]{"Business Promotion & Marketing Expenses", "Advertisment & Sales Promotion", "Commission"},
                new String[]{"Telephone & Internet", "Phone & Internet bills", "Telephone & Internet"},
                new String[]{"Electricity", "Electricity"},
                new String[]{"Office Rent", "Rent", "Rent Expenses"},
                new String[]{"Insurance", "Insurance"},
                new String[]{"Office Repair & Maintance", "Maintance & Repair", "Repair & Maintance"},
                new String[]{"Depreciation"},
                new String[]{"Printing & Stationery", "Stationery & Documents", "Printing & Stationery"},
                new String[]{"Accountancy Fee", "Accountancy Fee", "Accountany Fee"},
                new String[]{"Audit Fee", "Audit Fee"}
        );
        int first = adminHeader + 1;
        int financeRow = findRow(sheet, "Finance Cost", 1);
        resizeBefore(sheet, financeRow, financeRow - first, rows.size() + 2, 6);
        for (int i = 0; i < rows.size(); i++) {
            int row = first + i;
            String[] entry = rows.get(i);
            setText(sheet, row, 1, entry[0]);
            String formula = i == 2 || i == 3
                    ? "'Working'!" + (i == 2 ? "C" : "D")
                    + (findRow(requiredSheet(workbook, "Working"), "Total", 0) + 1)
                    : i == 11
                    ? "'PPE'!G" + (findRow(requiredSheet(workbook, "PPE"), "Total", 0) + 1)
                    : findTbExpenseFormula(workbook, Arrays.copyOfRange(entry, 1, entry.length));
            if (formula != null) setFormula(sheet, row, 3, formula);
            else clearCell(sheet, row, 3);
        }
        int total = first + rows.size();
        setFormula(sheet, total, 3, "SUM(D" + (first + 1) + ":D" + total + ")");
        Sheet tb = requiredSheet(workbook, "TB");
        int badDebts = findRow(tb, "Bad Debts", 0);
        if (badDebts >= 0) {
            int label = findRow(sheet, "Bad Debts", 1);
            if (label >= 0) setFormula(sheet, label, 3, "'TB'!B" + (badDebts + 1));
        }
        int tax = findRow(tb, "Income Tax", 0);
        int taxLabel = findRow(sheet, "Current Tax Expense", 1);
        if (tax >= 0 && taxLabel >= 0) setFormula(sheet, taxLabel, 3, "'TB'!B" + (tax + 1));
    }

    private void fillP11(Workbook workbook, Map<String, Object> p11, LocalDate endDate) {
        Sheet sheet = requiredSheet(workbook, "P11");
        setNumber(sheet, 2, 9, endDate.getYear());
        setNumber(sheet, 11, 9, number(p11.get("numberOfShares")));
        setFormula(sheet, 12, 9, "SUM(J12)");
        setTbReference(workbook, sheet, 6, List.of("Cash In Hand", "Cash"), 1);
        setFormula(sheet, 7, 9, "SUM(J7:J7)");
        setTbReference(workbook, sheet, 15, List.of("Share capital", "Stated Capital"), 2);
        setFormula(sheet, 16, 9, "SUM(J16)");
        setTbReference(workbook, sheet, 19, List.of("EPF"), 2);
        setTbReference(workbook, sheet, 20, List.of("ETF"), 2);
        setTbReference(workbook, sheet, 21, List.of("Accountancy Fee", "Accountany Fee"), 2);
        setTbReference(workbook, sheet, 22, List.of("Audit Fee"), 2);
        setFormula(sheet, 23, 9, "SUM(J20:J23)");
    }

    private void fillEquity(Workbook workbook, Map<String, Object> ce, LocalDate endDate) {
        Sheet sheet = requiredSheet(workbook, "CE");
        LocalDate opening = endDate.minusYears(1).plusDays(1);
        setText(sheet, 2, 0, "FOR THE PERIOD ENDED " + equityDate(endDate).toUpperCase());
        setText(sheet, 6, 0, "Balance as at " + equityDate(opening));
        setText(sheet, 12, 0, "Balance as at " + equityDate(endDate));
        setNumber(sheet, 6, 4, firstValue(ce.get("statedCapitalBalance")));
        setNumber(sheet, 6, 6, firstValue(ce.get("retainedEarningBalance")));
        setNumber(sheet, 8, 6, firstValue(ce.get("retainedEarningShares"), "Shares Issued"));
        setNumber(sheet, 10, 4, firstValue(ce.get("statedCapitalPL"), "Profit or Loss for the Period"));
        Sheet tb = requiredSheet(workbook, "TB");
        int shareCapital = findRow(tb, "Share capital", 0);
        if (shareCapital >= 0) setFormula(sheet, 8, 4, "'TB'!C" + (shareCapital + 1));
        setFormula(sheet, 6, 8, "E7+G7");
        setFormula(sheet, 8, 8, "E9+G9");
        setFormula(sheet, 10, 8, "E11+G11");
        setFormula(sheet, 12, 4, "SUM(E7:E11)");
        setFormula(sheet, 12, 6, "SUM(G7:G11)");
        setFormula(sheet, 12, 8, "SUM(I7:I11)");
    }

    private void fillCashFlow(Workbook workbook, Map<String, Object> cf) {
        Sheet sheet = requiredSheet(workbook, "CF");
        setNumber(sheet, 28, 6, number(cf.get("openingCashBalance")));
        setNumber(sheet, 32, 6, number(cf.get("cashInHandAmount")));
        Sheet tb = requiredSheet(workbook, "TB");
        int incomeTax = findRow(tb, "Income Tax", 0);
        if (incomeTax >= 0) setFormula(sheet, 16, 6, "'TB'!B" + (incomeTax + 1));
    }

    private void updateCashFlowReferences(Workbook workbook) {
        Sheet cf = requiredSheet(workbook, "CF");
        Sheet p09 = requiredSheet(workbook, "P09");
        int depreciation = findRow(p09, "Depreciation", 1);
        if (depreciation >= 0) setFormula(cf, 8, 6, "'P09'!D" + (depreciation + 1));
    }

    private void fillIncomeTax(Workbook workbook, Map<String, Object> tax, LocalDate endDate) {
        Sheet sheet = requiredSheet(workbook, "Income Tax");
        List<Map<String, Object>> assets = entries(tax.get("assetYear"));
        int first = 34;
        int total = 36;
        int delta = Math.max(assets.size(), 1) - 1;
        if (delta > 0) shiftRows(sheet, total, delta);
        int currentTotal = total + Math.max(delta, 0);
        for (int i = 0; i < Math.max(assets.size(), 1); i++) {
            int row = first + i;
            if (i > 0) copyRowStyle(sheet, first, row, 10);
            Map<String, Object> item = i < assets.size() ? assets.get(i) : Map.of();
            setText(sheet, row, 0, text(item.get("name")));
            setNumber(sheet, row, 2, number(item.get("years")));
            linkFormula(sheet, row, 1, "'P10'!G" + (6 + i));
            linkFormula(sheet, row, 3, "'P10'!E" + (6 + i));
            setFormula(sheet, row, 4, "B" + (row + 1) + "/C" + (row + 1));
            setFormula(sheet, row, 5, "D" + (row + 1) + "+E" + (row + 1));
            setFormula(sheet, row, 7, "B" + (row + 1) + "-F" + (row + 1));
        }
        for (int[] pair : new int[][]{{1, 1}, {3, 3}, {4, 4}, {5, 5}, {7, 7}}) {
            int col = pair[0];
            String letter = CellReference.convertNumToColString(col);
            setFormula(sheet, currentTotal, col, assets.isEmpty() ? "0" :
                    "SUM(" + letter + (first + 1) + ":" + letter + (first + assets.size()) + ")");
        }
        LocalDate balanceDate = null;
        BigDecimal balanceAmount = BigDecimal.ZERO;
        Object balance = tax.get("balanceBF");
        if (balance instanceof Map<?, ?> map && !map.isEmpty()) {
            Map.Entry<?, ?> entry = map.entrySet().iterator().next();
            balanceDate = parseDate(entry.getKey());
            balanceAmount = decimal(entry.getValue());
        }
        String assessment = assessmentYear(endDate);
        setText(sheet, 2, 0, "YEAR OF ASSESSMENT " + assessment);
        setText(sheet, 32, 0, assessment);
        setNumber(sheet, 7, 7, number(tax.get("withholdingPayments")));
        setNumber(sheet, currentTotal + 4, 7, balanceAmount.doubleValue());
        setNumber(sheet, currentTotal + 9, 7, number(tax.get("investmentIncome")));
        setNumber(sheet, currentTotal + 10, 7, number(tax.get("businessIncome")));
        if (balanceDate != null) setText(sheet, currentTotal + 4, 0,
                "Brought Forward from " + assessmentYear(balanceDate));
        setText(sheet, currentTotal + 11, 0, "Carried Forward to " + assessmentYear(endDate.plusYears(1)));
        setFormula(sheet, 16, 7, "IF(H15<0,\"Loss\",\"Profit\")");
        setFormula(sheet, 18, 5, "IF(H15>0,H15,0)");
        setFormula(sheet, 18, 7, "F19*0.3");
        workbook.setForceFormulaRecalculation(true);
    }

    private void fillPeriodHeaders(Workbook workbook, LocalDate endDate) {
        String formatted = equityDate(endDate).toUpperCase();
        Sheet bs = requiredSheet(workbook, "BS");
        setText(bs, 2, 0, "AS AT " + formatted);
        setNumber(bs, 2, 4, endDate.getYear());
        Sheet pl = requiredSheet(workbook, "PL");
        setText(pl, 2, 0, "FOR THE YEAR ENDED " + formatted);
        setNumber(pl, 2, 3, endDate.getYear());
        Sheet p09 = requiredSheet(workbook, "P09");
        setText(p09, 2, 0, "FOR THE PERIOD ENDED " + formatted);
        setNumber(p09, 2, 3, endDate.getYear());
    }

    private Map<String, List<Map<String, Object>>> normalizeTrialBalance(Map<String, Object> tb) {
        Map<String, String> aliases = Map.ofEntries(
                Map.entry("bankaccounts", "BankAccounts"), Map.entry("bank accounts", "BankAccounts"),
                Map.entry("bankaccount", "BankAccounts"), Map.entry("bank account", "BankAccounts"),
                Map.entry("assets", "Assets"), Map.entry("asset", "Assets"),
                Map.entry("liabilities", "Liabilities"), Map.entry("liability", "Liabilities"),
                Map.entry("equity", "Equity"), Map.entry("income", "Income"),
                Map.entry("expenses", "Expenses"), Map.entry("expense", "Expenses")
        );
        Map<String, List<Map<String, Object>>> result = new LinkedHashMap<>();
        TB_SECTIONS.forEach(section -> result.put(section.getKey(), new ArrayList<>()));
        tb.forEach((key, value) -> {
            String section = aliases.get(key.toLowerCase(Locale.ROOT));
            if (section == null || !(value instanceof List<?> values)) return;
            Map<String, Map<String, Object>> grouped = new LinkedHashMap<>();
            for (Object raw : values) {
                Map<String, Object> item = map(raw);
                String name = text(item.getOrDefault("accountName", item.get("name"))).trim();
                if (name.isEmpty()) continue;
                Map<String, Object> acc = grouped.computeIfAbsent(name, ignored -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("accountName", name);
                    m.put("dr", 0d);
                    m.put("cr", 0d);
                    return m;
                });
                String type = text(item.getOrDefault("transactionType", item.get("type"))).trim().toUpperCase(Locale.ROOT);
                String col = "CR".equals(type) ? "cr" : "dr";
                acc.put(col, number(acc.get(col)) + number(item.getOrDefault("amount", item.get("value"))));
            }
            grouped.values().forEach(item -> {
                double net = number(item.get("dr")) - number(item.get("cr"));
                item.put("dr", Math.max(net, 0));
                item.put("cr", Math.max(-net, 0));
            });
            result.put(section, new ArrayList<>(grouped.values()));
        });
        return result;
    }

    private String findTbExpenseFormula(Workbook workbook, String[] aliases) {
        Sheet tb = requiredSheet(workbook, "TB");
        int row = -1;
        for (String alias : aliases) {
            row = findRow(tb, alias, 0);
            if (row >= 0) break;
        }
        return row < 0 ? null : "'TB'!B" + (row + 1);
    }

    private void setTbReference(Workbook workbook, Sheet target, int row, List<String> aliases, int sourceColumn) {
        Sheet tb = requiredSheet(workbook, "TB");
        for (String alias : aliases) {
            int source = findRow(tb, alias, 0);
            if (source >= 0) {
                setFormula(target, row, 9,
                        "'TB'!" + CellReference.convertNumToColString(sourceColumn) + (source + 1));
                return;
            }
        }
        clearCell(target, row, 9);
    }

    private static void resizeSection(Sheet sheet, int firstDataRow, int nextHeader, int itemCount, int maxColumn) {
        int available = nextHeader - firstDataRow;
        int required = itemCount + 1;
        int delta = required - available;
        if (delta < 0) clearRows(sheet, firstDataRow + required, nextHeader - 1);
        if (delta != 0) shiftRows(sheet, nextHeader, delta);
        for (int i = 1; i < itemCount; i++) copyRowStyle(sheet, firstDataRow, firstDataRow + i, maxColumn);
    }

    private static void resizeBefore(Sheet sheet, int atRow, int availableRows, int desiredRows, int maxColumn) {
        int delta = desiredRows - availableRows;
        if (delta != 0) {
            shiftRows(sheet, atRow, delta);
            if (delta < 0) clearRows(sheet, atRow + delta + 1, atRow - 1);
        }
        if (desiredRows > 1) {
            int template = Math.max(atRow - 1, 0);
            for (int i = 1; i < desiredRows; i++) copyRowStyle(sheet, template, template + i, maxColumn);
        }
    }

    private static void shiftRows(Sheet sheet, int startRow, int delta) {
        if (delta != 0 && startRow <= sheet.getLastRowNum()) {
            sheet.shiftRows(startRow, sheet.getLastRowNum(), delta, true, false);
        }
    }

    private static CellStyle[] rowStyles(Row row, int maxColumn) {
        CellStyle[] styles = new CellStyle[maxColumn + 1];
        if (row == null) return styles;
        for (int column = 0; column <= maxColumn; column++) {
            Cell cell = row.getCell(column);
            if (cell != null) styles[column] = cell.getCellStyle();
        }
        return styles;
    }

    private static void applyRowStyles(Sheet sheet, int rowIndex, CellStyle[] styles, int maxColumn) {
        if (styles == null) return;
        Row row = sheet.getRow(rowIndex);
        if (row == null) row = sheet.createRow(rowIndex);
        for (int column = 0; column <= maxColumn; column++) {
            if (styles[column] == null) continue;
            Cell cell = row.getCell(column);
            if (cell == null) cell = row.createCell(column);
            cell.setCellStyle(styles[column]);
        }
    }

    private static void clearRows(Sheet sheet, int first, int last) {
        for (int row = Math.max(first, 0); row <= last; row++) {
            Row existing = sheet.getRow(row);
            if (existing != null) sheet.removeRow(existing);
        }
    }

    private static void copyRowStyle(Sheet sheet, int sourceIndex, int targetIndex, int maxColumn) {
        Row source = sheet.getRow(sourceIndex);
        if (source == null) return;
        Row target = sheet.getRow(targetIndex);
        if (target == null) target = sheet.createRow(targetIndex);
        target.setHeight(source.getHeight());
        for (int col = 0; col <= maxColumn; col++) {
            Cell sourceCell = source.getCell(col);
            if (sourceCell == null) continue;
            Cell targetCell = target.getCell(col);
            if (targetCell == null) targetCell = target.createCell(col);
            targetCell.setCellStyle(sourceCell.getCellStyle());
            if (sourceCell.getCellType() == CellType.FORMULA) targetCell.setCellFormula(sourceCell.getCellFormula());
            else if (sourceCell.getCellType() == CellType.STRING) targetCell.setCellValue(sourceCell.getStringCellValue());
            else if (sourceCell.getCellType() == CellType.NUMERIC) targetCell.setCellValue(sourceCell.getNumericCellValue());
            else if (sourceCell.getCellType() == CellType.BOOLEAN) targetCell.setCellValue(sourceCell.getBooleanCellValue());
            else targetCell.setBlank();
        }
    }

    private static void boldRow(Sheet sheet, int rowIndex, int maxColumn) {
        setRowBold(sheet, rowIndex, maxColumn, true);
    }

    private static void unboldRow(Sheet sheet, int rowIndex, int maxColumn) {
        setRowBold(sheet, rowIndex, maxColumn, false);
    }

    private static void setRowBold(Sheet sheet, int rowIndex, int maxColumn, boolean bold) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) return;
        Workbook workbook = sheet.getWorkbook();
        for (int col = 0; col <= maxColumn; col++) {
            Cell cell = row.getCell(col);
            if (cell == null) continue;
            CellStyle style = workbook.createCellStyle();
            style.cloneStyleFrom(cell.getCellStyle());
            Font old = workbook.getFontAt(cell.getCellStyle().getFontIndexAsInt());
            Font font = workbook.createFont();
            font.setBold(bold);
            font.setFontName(old.getFontName());
            font.setFontHeight(old.getFontHeight());
            font.setColor(old.getColor());
            font.setItalic(old.getItalic());
            font.setUnderline(old.getUnderline());
            style.setFont(font);
            cell.setCellStyle(style);
        }
    }

    private static int findRow(Sheet sheet, String value, int column) {
        for (Row row : sheet) {
            Cell cell = row.getCell(column);
            if (cell != null && value.equalsIgnoreCase(cellText(cell).trim())) return row.getRowNum();
        }
        return -1;
    }

    private static String cellText(Cell cell) {
        if (cell == null) return "";
        CellType type = cell.getCellType() == CellType.FORMULA
                ? cell.getCachedFormulaResultType()
                : cell.getCellType();
        if (type == CellType.STRING) return cell.getStringCellValue();
        return new DataFormatter(Locale.ROOT).formatCellValue(cell);
    }

    private static Sheet requiredSheet(Workbook workbook, String name) {
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            Sheet sheet = workbook.getSheetAt(i);
            if (sheet.getSheetName().trim().equalsIgnoreCase(name.trim())) return sheet;
        }
        throw new IllegalStateException(name + " sheet not found in template");
    }

    private static void setText(Sheet sheet, int rowIndex, int column, String value) {
        Cell cell = cell(sheet, rowIndex, column);
        cell.setCellValue(value == null ? "" : value);
    }

    private static void setNumber(Sheet sheet, int rowIndex, int column, double value) {
        Cell cell = cell(sheet, rowIndex, column);
        cell.setCellValue(Double.isFinite(value) ? value : 0);
    }

    private static void setDate(Sheet sheet, int rowIndex, int column, Object value, String format) {
        LocalDate date = parseDate(value);
        if (date == null) {
            clearCell(sheet, rowIndex, column);
            return;
        }
        Cell cell = cell(sheet, rowIndex, column);
        cell.setCellValue(java.sql.Date.valueOf(date));
        CellStyle style = sheet.getWorkbook().createCellStyle();
        style.cloneStyleFrom(cell.getCellStyle());
        style.setDataFormat(sheet.getWorkbook().getCreationHelper().createDataFormat().getFormat(format));
        cell.setCellStyle(style);
    }

    private static void setFormula(Sheet sheet, int rowIndex, int column, String formula) {
        Cell cell = cell(sheet, rowIndex, column);
        cell.setCellFormula(formula.startsWith("=") ? formula.substring(1) : formula);
    }

    private static void linkFormula(Sheet sheet, int rowIndex, int column, String formula) {
        setFormula(sheet, rowIndex, column, formula);
    }

    private static void clearCell(Sheet sheet, int rowIndex, int column) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) return;
        Cell cell = row.getCell(column);
        if (cell != null) cell.setBlank();
    }

    private static Cell cell(Sheet sheet, int rowIndex, int column) {
        Row row = sheet.getRow(rowIndex);
        if (row == null) row = sheet.createRow(rowIndex);
        Cell cell = row.getCell(column);
        return cell == null ? row.createCell(column) : cell;
    }

    private Map<String, Object> map(Object value) {
        if (value instanceof Map<?, ?> source) {
            Map<String, Object> result = new LinkedHashMap<>();
            source.forEach((key, item) -> result.put(String.valueOf(key), item));
            return result;
        }
        if (value == null) return new LinkedHashMap<>();
        try {
            Map<String, Object> result = new LinkedHashMap<>();
            for (var descriptor : Introspector.getBeanInfo(value.getClass(), Object.class).getPropertyDescriptors()) {
                Method readMethod = descriptor.getReadMethod();
                if (readMethod != null) result.put(descriptor.getName(), readMethod.invoke(value));
            }
            return result;
        } catch (ReflectiveOperationException | java.beans.IntrospectionException e) {
            throw new IllegalStateException("Unable to read report data", e);
        }
    }

    private List<?> list(Object value) {
        return value instanceof List<?> values ? values : List.of();
    }

    private List<Map<String, Object>> entries(Object value) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object entry : list(value)) {
            if (entry instanceof Map<?, ?> values) {
                values.forEach((key, item) -> result.add(Map.of(
                        "name", String.valueOf(key), "value", item == null ? 0 : item)));
            } else {
                Map<String, Object> mapped = map(entry);
                if (!mapped.isEmpty()) result.add(mapped);
            }
        }
        return result;
    }

    private static double number(Object value) {
        if (value instanceof Number n) return n.doubleValue();
        try {
            return value == null ? 0 : Double.parseDouble(value.toString());
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private static BigDecimal decimal(Object value) {
        try {
            return value == null ? BigDecimal.ZERO : new BigDecimal(value.toString());
        } catch (NumberFormatException ignored) {
            return BigDecimal.ZERO;
        }
    }

    private static String text(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private static LocalDate parseDate(Object value) {
        if (value instanceof LocalDate date) return date;
        if (value instanceof Date date) return new java.sql.Date(date.getTime()).toLocalDate();
        try {
            if (value == null) return null;
            String text = value.toString();
            if (text.length() == 7) return YearMonth.parse(text).atDay(1);
            return LocalDate.parse(text.substring(0, 10));
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private static String date(Object value, String pattern) {
        LocalDate date = parseDate(value);
        return date == null ? "" : date.format(DateTimeFormatter.ofPattern(pattern));
    }

    private static String equityDate(LocalDate date) {
        int day = date.getDayOfMonth();
        String suffix = day % 10 == 1 && day != 11 ? "st"
                : day % 10 == 2 && day != 12 ? "nd"
                : day % 10 == 3 && day != 13 ? "rd" : "th";
        return String.format("%02d%s %s", day, suffix, date.format(DateTimeFormatter.ofPattern("MMMM yyyy")));
    }

    private static String assessmentYear(LocalDate date) {
        return (date.getYear() - 1) + "/" + date.getYear();
    }

    private static double firstValue(Object value, String preferredKey) {
        Map<String, Object> values = mapStatic(value);
        Object preferred = values.get(preferredKey);
        if (preferred != null) return number(preferred);
        return firstValue(value);
    }

    private static double firstValue(Object value) {
        if (value instanceof Map<?, ?> values && !values.isEmpty()) {
            return number(values.values().iterator().next());
        }
        return 0;
    }

    private static Map<String, Object> mapStatic(Object value) {
        if (!(value instanceof Map<?, ?> source)) return Map.of();
        Map<String, Object> result = new LinkedHashMap<>();
        source.forEach((key, item) -> result.put(String.valueOf(key), item));
        return result;
    }
}

package com.lankacapital.server.services.impl;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellReference;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.Array;
import java.sql.Blob;
import java.sql.Clob;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.SQLXML;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class DatabaseBackupExportService {
    private static final int MAX_ROWS_PER_SHEET = 1_048_576;
    private static final int MAX_CELL_TEXT_LENGTH = 32_767;
    private static final int MAX_SHEET_NAME_LENGTH = 31;

    private final DataSource dataSource;

    public DatabaseBackupExportService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public byte[] exportDatabase() throws SQLException, IOException {
        SXSSFWorkbook workbook = new SXSSFWorkbook(100);
        workbook.setCompressTempFiles(true);
        try (Connection connection = dataSource.getConnection();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            DatabaseMetaData metadata = connection.getMetaData();
            List<String> tableNames = readTableNames(metadata, connection.getCatalog());
            if (tableNames.isEmpty()) {
                Sheet sheet = workbook.createSheet("No Tables");
                sheet.createRow(0).createCell(0).setCellValue("No database tables found");
            } else {
                Set<String> usedSheetNames = new HashSet<>();
                String quote = metadata.getIdentifierQuoteString();
                for (String tableName : tableNames) {
                    exportTable(workbook, connection, tableName, quote, usedSheetNames);
                }
            }
            workbook.write(output);
            return output.toByteArray();
        } finally {
            workbook.dispose();
            workbook.close();
        }
    }

    private List<String> readTableNames(DatabaseMetaData metadata, String catalog) throws SQLException {
        List<String> tableNames = new ArrayList<>();
        try (ResultSet tables = metadata.getTables(catalog, null, "%", new String[]{"TABLE"})) {
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                if (tableName != null && !tableName.isBlank()) tableNames.add(tableName);
            }
        }
        tableNames.sort(Comparator.comparing(name -> name.toLowerCase(Locale.ROOT)));
        return tableNames;
    }

    private void exportTable(
            Workbook workbook,
            Connection connection,
            String tableName,
            String identifierQuote,
            Set<String> usedSheetNames
    ) throws SQLException {
        String quote = identifierQuote == null ? "" : identifierQuote.trim();
        String quotedTable = quote.isEmpty()
                ? tableName
                : quote + tableName.replace(quote, quote + quote) + quote;
        try (Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("SELECT * FROM " + quotedTable)) {
            ResultSetMetaData columns = result.getMetaData();
            List<String> columnNames = new ArrayList<>(columns.getColumnCount());
            for (int column = 1; column <= columns.getColumnCount(); column++) {
                columnNames.add(columns.getColumnLabel(column));
            }

            int sheetPart = 1;
            Sheet sheet = createTableSheet(workbook, tableName, sheetPart, usedSheetNames, columnNames);
            int rowIndex = 1;
            while (result.next()) {
                if (rowIndex >= MAX_ROWS_PER_SHEET) {
                    sheetPart++;
                    sheet = createTableSheet(workbook, tableName, sheetPart, usedSheetNames, columnNames);
                    rowIndex = 1;
                }
                Row row = sheet.createRow(rowIndex++);
                for (int column = 1; column <= columns.getColumnCount(); column++) {
                    Object value = result.getObject(column);
                    String text = cellText(value);
                    if (text == null) continue;
                    if (text.length() > MAX_CELL_TEXT_LENGTH) {
                        throw new SQLException("A value in table " + tableName
                                + " exceeds Excel's maximum cell text length");
                    }
                    row.createCell(column - 1).setCellValue(text);
                }
            }
        }
    }

    private Sheet createTableSheet(
            Workbook workbook,
            String tableName,
            int sheetPart,
            Set<String> usedSheetNames,
            List<String> columnNames
    ) {
        String suffix = sheetPart == 1 ? "" : " (" + sheetPart + ")";
        String baseName = sanitizeSheetName(tableName, suffix);
        String sheetName = uniqueSheetName(baseName, usedSheetNames);
        Sheet sheet = workbook.createSheet(sheetName);
        sheet.createFreezePane(0, 1);
        Row header = sheet.createRow(0);
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        for (int i = 0; i < columnNames.size(); i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(columnNames.get(i));
            cell.setCellStyle(headerStyle);
        }
        return sheet;
    }

    private String sanitizeSheetName(String tableName, String suffix) {
        String sanitized = tableName.replaceAll("[\\\\/\\?\\*\\[\\]:]", "_").trim();
        if (sanitized.isEmpty()) sanitized = "Table";
        int baseLength = Math.max(1, MAX_SHEET_NAME_LENGTH - suffix.length());
        return sanitized.substring(0, Math.min(sanitized.length(), baseLength)) + suffix;
    }

    private String uniqueSheetName(String baseName, Set<String> usedSheetNames) {
        String candidate = baseName;
        int duplicate = 2;
        while (!usedSheetNames.add(candidate.toLowerCase(Locale.ROOT))) {
            String suffix = " (" + duplicate++ + ")";
            int baseLength = Math.max(1, MAX_SHEET_NAME_LENGTH - suffix.length());
            candidate = baseName.substring(0, Math.min(baseName.length(), baseLength)) + suffix;
        }
        return candidate;
    }

    private String cellText(Object value) throws SQLException {
        if (value == null) return null;
        if (value instanceof byte[] bytes) return Base64.getEncoder().encodeToString(bytes);
        if (value instanceof Blob blob) {
            long length = blob.length();
            if (length > MAX_CELL_TEXT_LENGTH * 3L / 4L) {
                throw new SQLException("A binary value exceeds Excel's maximum cell text length");
            }
            return Base64.getEncoder().encodeToString(blob.getBytes(1, (int) length));
        }
        if (value instanceof Clob clob) {
            long length = clob.length();
            if (length > MAX_CELL_TEXT_LENGTH) {
                throw new SQLException("A text value exceeds Excel's maximum cell text length");
            }
            return clob.getSubString(1, (int) length);
        }
        if (value instanceof SQLXML sqlxml) return sqlxml.getString();
        if (value instanceof Array array) return String.valueOf(array.getArray());
        if (value instanceof java.math.BigDecimal decimal) return decimal.toPlainString();
        return value.toString();
    }
}
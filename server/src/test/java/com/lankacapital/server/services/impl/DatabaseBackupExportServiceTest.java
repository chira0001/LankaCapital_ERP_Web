package com.lankacapital.server.services.impl;

import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.junit.jupiter.api.Test;

import javax.sql.DataSource;
import java.io.ByteArrayInputStream;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DatabaseBackupExportServiceTest {
    @Test
    void exportsEachDatabaseTableToItsOwnWorksheet() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData databaseMetaData = mock(DatabaseMetaData.class);
        ResultSet tables = mock(ResultSet.class);
        Statement customerStatement = mock(Statement.class);
        Statement loanStatement = mock(Statement.class);
        ResultSet customerRows = mock(ResultSet.class);
        ResultSet loanRows = mock(ResultSet.class);
        ResultSetMetaData customerColumns = mock(ResultSetMetaData.class);
        ResultSetMetaData loanColumns = mock(ResultSetMetaData.class);

        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getCatalog()).thenReturn("lankacapital");
        when(connection.getMetaData()).thenReturn(databaseMetaData);
        when(databaseMetaData.getIdentifierQuoteString()).thenReturn("`");
        when(databaseMetaData.getTables(eq("lankacapital"), eq(null), eq("%"), any(String[].class)))
                .thenReturn(tables);
        when(tables.next()).thenReturn(true, true, false);
        when(tables.getString("TABLE_NAME")).thenReturn("customers", "loans");
        when(connection.createStatement()).thenReturn(customerStatement, loanStatement);
        when(customerStatement.executeQuery("SELECT * FROM `customers`")).thenReturn(customerRows);
        when(loanStatement.executeQuery("SELECT * FROM `loans`")).thenReturn(loanRows);

        when(customerRows.getMetaData()).thenReturn(customerColumns);
        when(customerColumns.getColumnCount()).thenReturn(2);
        when(customerColumns.getColumnLabel(1)).thenReturn("id");
        when(customerColumns.getColumnLabel(2)).thenReturn("email");
        when(customerRows.next()).thenReturn(true, true, false);
        when(customerRows.getObject(1)).thenReturn(10L, 11L);
        when(customerRows.getObject(2)).thenReturn("one@example.com", "two@example.com");

        when(loanRows.getMetaData()).thenReturn(loanColumns);
        when(loanColumns.getColumnCount()).thenReturn(1);
        when(loanColumns.getColumnLabel(1)).thenReturn("loan_number");
        when(loanRows.next()).thenReturn(true, false);
        when(loanRows.getObject(1)).thenReturn("LN-001");

        DatabaseBackupExportService exportService = new DatabaseBackupExportService(dataSource);
        byte[] bytes = exportService.exportDatabase();

        try (var workbook = WorkbookFactory.create(new ByteArrayInputStream(bytes))) {
            assertEquals(2, workbook.getNumberOfSheets());
            var customers = workbook.getSheet("customers");
            assertNotNull(customers);
            assertEquals("id", customers.getRow(0).getCell(0).getStringCellValue());
            assertEquals("email", customers.getRow(0).getCell(1).getStringCellValue());
            assertEquals("10", customers.getRow(1).getCell(0).getStringCellValue());
            assertEquals("two@example.com", customers.getRow(2).getCell(1).getStringCellValue());

            var loans = workbook.getSheet("loans");
            assertNotNull(loans);
            assertEquals("loan_number", loans.getRow(0).getCell(0).getStringCellValue());
            assertEquals("LN-001", loans.getRow(1).getCell(0).getStringCellValue());
        }
    }
}
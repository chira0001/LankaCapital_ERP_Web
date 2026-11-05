package com.lankacapital.server.services;

import java.io.IOException;
import java.time.LocalDate;

public interface FinancialReportExportService {
    byte[] export(String reportType, LocalDate startDate, LocalDate endDate) throws IOException;
}

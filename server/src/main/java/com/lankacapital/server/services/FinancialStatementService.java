package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;
//import com.lankacapital.server.entities.FinancialStatement;

import java.util.HashMap;

public interface FinancialStatementService {

    HashMap<String, Object> generateReports(String reportType, String startDate, String endDate);
}
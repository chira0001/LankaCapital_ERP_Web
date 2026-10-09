package com.lankacapital.server.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface LoanWeeklySummaryProjection {
    String getFileNumber();
    BigDecimal getPaidAmount();
    BigDecimal getDueAmount();
    Integer getInstallmentNo();
    LocalDateTime getStartedAt();
}

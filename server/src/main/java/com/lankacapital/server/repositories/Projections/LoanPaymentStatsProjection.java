package com.lankacapital.server.repositories.Projections;

import java.math.BigDecimal;

public interface LoanPaymentStatsProjection {
    Long getLoanId();
    BigDecimal getTotalPaid();
    Long getPaidCount(); // count of paid installments (paidAt != null)
}
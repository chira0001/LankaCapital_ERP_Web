package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.CashFlowData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface CashFlowDataRepository extends JpaRepository<CashFlowData, Long> {
    boolean existsByFinancialDate(LocalDate financialDate);

    CashFlowData findByFinancialDateBetween(
            LocalDate start,
            LocalDate end
    );
}

package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.TrialBalanceData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

import java.util.List;

@Repository
public interface TrialBalanceDataRepository extends JpaRepository<TrialBalanceData,Long> {

    List<TrialBalanceData> findByFinancialDateBetween(
            LocalDate start,
            LocalDate end
    );

}

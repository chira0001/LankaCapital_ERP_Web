package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.EquityChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquityChangeRepository extends JpaRepository<EquityChange, Long> {
    boolean existsByFinancialDate(LocalDate financialDate);

    List<EquityChange> findByFinancialDateBetween(
            LocalDate start,
            LocalDate end
    );
}

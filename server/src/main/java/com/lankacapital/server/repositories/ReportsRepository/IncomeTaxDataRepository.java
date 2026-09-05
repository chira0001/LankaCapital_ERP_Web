package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.IncomeTaxData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface IncomeTaxDataRepository extends JpaRepository<IncomeTaxData, Long> {
    boolean existsByFinancialDate(LocalDate financialDate);
    Optional<IncomeTaxData> findTopByFinancialDate(LocalDate financialDate);
}

package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.FinancialStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialStatementRepository extends JpaRepository<FinancialStatement,Long> {
    //Optional<FinancialStatement> findByMonth(String month);

    Optional<FinancialStatement> findByReportDate(LocalDate reportDate);
    List<FinancialStatement> findByReportDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}

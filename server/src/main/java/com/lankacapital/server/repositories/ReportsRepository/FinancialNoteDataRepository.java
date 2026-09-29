package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.FinancialNoteData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancialNoteDataRepository extends JpaRepository<FinancialNoteData, Long> {
    List<FinancialNoteData> findByFinancialDateBetween(
            LocalDate start,
            LocalDate end
    );
}

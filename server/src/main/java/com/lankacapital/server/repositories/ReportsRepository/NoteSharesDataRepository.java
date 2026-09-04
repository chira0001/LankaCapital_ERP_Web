package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.NoteSharesData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface NoteSharesDataRepository extends JpaRepository<NoteSharesData,Long> {
    Optional<NoteSharesData> findTopByFinancialDate(LocalDate financialDate);
    boolean existsByFinancialDate(LocalDate financialDate);
}

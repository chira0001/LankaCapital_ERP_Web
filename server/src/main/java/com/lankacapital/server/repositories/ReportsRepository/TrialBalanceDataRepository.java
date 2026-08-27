package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.TrialBalanceData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrialBalanceDataRepository extends JpaRepository<TrialBalanceData,Long> {
}

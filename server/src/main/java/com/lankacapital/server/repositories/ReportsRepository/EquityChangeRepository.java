package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.EquityChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquityChangeRepository extends JpaRepository<EquityChange, Long> {
}

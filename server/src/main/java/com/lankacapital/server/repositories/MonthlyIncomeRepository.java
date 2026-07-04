package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.MonthlyIncome;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MonthlyIncomeRepository extends JpaRepository<MonthlyIncome, Long> {

    Optional<MonthlyIncome> findByMonth(String month);
    boolean existsByMonth(String month);
}
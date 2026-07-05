package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.MonthlyIncome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface MonthlyIncomeRepository extends JpaRepository<MonthlyIncome, Long> {

    Optional<MonthlyIncome> findByMonth(String month);
    boolean existsByMonth(String month);


    @Query("SELECT COALESCE(SUM(m.totalIncome), 0) FROM MonthlyIncome m")
    BigDecimal sumAllIncome();

    @Query("SELECT COALESCE(SUM(m.totalIncome), 0) FROM MonthlyIncome m WHERE m.month = :month")
    BigDecimal getIncomeByMonth(@Param("month") String month);
}
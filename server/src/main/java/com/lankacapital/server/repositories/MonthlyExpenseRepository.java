package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.MonthlyExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface MonthlyExpenseRepository extends JpaRepository<MonthlyExpense, Long> {
    Boolean existsByMonth(String month);
    Optional<MonthlyExpense> findByMonth(String month);

    @Query("SELECT COALESCE(SUM(m.totalExpenses), 0) FROM MonthlyExpense m")
    BigDecimal sumAllExpense();
}

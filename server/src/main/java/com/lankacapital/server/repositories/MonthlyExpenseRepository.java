package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.MonthlyExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MonthlyExpenseRepository extends JpaRepository<MonthlyExpense, Long> {
    Boolean existsByMonth(String month);
    Optional<MonthlyExpense> findByMonth(String month);
}

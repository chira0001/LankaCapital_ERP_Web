package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {
    Boolean existsByEmployeeAndMonth(Employee employee, String date);

    @Query("SELECT COALESCE(SUM(s.totalSalary), 0) FROM Salary s WHERE s.month = :month")
    BigDecimal getTotalSalaryByMonth(String month);}

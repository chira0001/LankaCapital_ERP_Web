package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Salary;
import com.lankacapital.server.enums.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {
    Boolean existsByEmployeeAndMonth(Employee employee, String date);
    Boolean existsByMonth(String date);
    List<Salary> findByMonth(String date);

    @Query("SELECT COALESCE(SUM(s.totalSalary), 0) FROM Salary s WHERE s.month = :month")
    BigDecimal getTotalSalaryByMonth(String month);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
        update Salary s
           set s.status = :approvedStatus,
               s.approvedEmployee = :approvedEmployee
         where s.month = :yearMonth
           and s.status = :pendingStatus
    """)
    int approveMonthSalaries(
            @Param("yearMonth") String yearMonth,
            @Param("pendingStatus") Request pendingStatus,
            @Param("approvedStatus") Request approvedStatus,
            @Param("approvedEmployee") Employee approvedEmployee
    );
}

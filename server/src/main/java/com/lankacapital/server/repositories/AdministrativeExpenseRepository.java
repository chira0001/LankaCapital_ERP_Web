package com.lankacapital.server.repositories;

import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAdministrativeExpenseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.AdministrativeExpense;
import com.lankacapital.server.enums.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AdministrativeExpenseRepository extends JpaRepository<AdministrativeExpense,Long> {
    List<AdministrativeExpense> findByRequestEmployee(Employee requestEmployee);
    List<AdministrativeExpense>findByRequest(Request request);
//    List<AdministrativeExpense> findAllByRequestOrderByDateTimeDesc(Request request);

    @Query(value = """
        SELECT category_name, sum(amount)
        FROM administrative_expense
        JOIN administrative_expense_category ON administrative_expense.category_id = administrative_expense_category.id
        WHERE request = 'APPROVED'
          AND date_time BETWEEN :startPeriod AND :endPeriod
        GROUP BY category_id
        """, nativeQuery = true)
    List<WorkingAdministrativeExpenseDto> fetchApprovedAdministrativeExpenseAndDateTimeBetweenStartPeriodAndEndPeriod(
            @Param("startPeriod") LocalDate startPeriod,
            @Param("endPeriod") LocalDate endPeriod);
}

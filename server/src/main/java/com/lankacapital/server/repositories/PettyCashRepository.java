package com.lankacapital.server.repositories;

import com.lankacapital.server.dtos.AdminDto.WorksheetDtos.WorkingSheet.WorkingAdministrativeExpenseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.PettyCash;
import com.lankacapital.server.enums.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PettyCashRepository extends JpaRepository<PettyCash,Long> {
    List<PettyCash> findByRequestEmployee(Employee requestEmployee);
    List<PettyCash>findByRequest(Request request);
//    List<PettyCash> findAllByRequestOrderByDateTimeDesc(Request request);

    @Query(value = """
        SELECT category_name, sum(amount)
        FROM petty_cash
        JOIN petty_cash_category ON petty_cash.category_id = petty_cash_category.id
        WHERE request = 'APPROVED'
          AND date_time BETWEEN :startPeriod AND :endPeriod
        GROUP BY category_id
        """, nativeQuery = true)
    List<WorkingAdministrativeExpenseDto> fetchApprovedPettyCashAndDateTimeBetweenStartPeriodAndEndPeriod(
            @Param("startPeriod") LocalDate startPeriod,
            @Param("endPeriod") LocalDate endPeriod);
}

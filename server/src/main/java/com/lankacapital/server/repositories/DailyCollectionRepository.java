package com.lankacapital.server.repositories;

import com.lankacapital.server.dtos.CollectionReqDto;
import com.lankacapital.server.dtos.LoanWeeklySummaryProjection;
import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.LoanType;
import com.lankacapital.server.repositories.Projections.LoanPaymentStatsProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyCollectionRepository extends JpaRepository<DailyCollection, UUID> {

    List<DailyCollection> findByLoanFileNumberOrderByInstallmentNumberDesc(String fileNumber);
    List<DailyCollection> findByPaidAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    Optional<DailyCollection> findFirstByLoan_FileNumberOrderByInstallmentNumberDesc(String fileNumber);

    Optional<DailyCollection> findFirstByLoan_IdAndInstallmentNumberOrderByPaidAtAsc(Long loanId, Integer installmentNumber);

    List<DailyCollection> findDailyCollectionByLoan_Id(Long loanId);

    @Query("""
        select dc.loan.id as loanId,
               coalesce(sum(dc.paidAmount), 0) as totalPaid,
               coalesce(sum(case when dc.paidAt is not null then 1 else 0 end), 0) as paidCount
        from DailyCollection dc
        where dc.loan.id in :loanIds
        group by dc.loan.id
    """)
    List<LoanPaymentStatsProjection> fetchPaymentStats(@Param("loanIds") List<Long> loanIds);

    @EntityGraph(attributePaths = {"employee"})
    Page<DailyCollection> findByLoanIdOrderByInstallmentNumberAsc(Long loanId, Pageable pageable);

    @Query(value = """
        SELECT 
            l.file_number AS fileNumber,
            COALESCE(SUM(dc.paid_amount), 0) AS paidAmount,
            COALESCE(SUM(dc.due_amount), 0) AS dueAmount,
            dc.installment_number AS installmentNo,
            MAX(dc.paid_at) AS startedAt
        FROM daily_collections dc
        JOIN loans l ON dc.loan_id = l.id
        INNER JOIN (
            SELECT loan_id, MAX(installment_number) AS max_inst
            FROM daily_collections
            GROUP BY loan_id
        ) latest_inst 
          ON dc.loan_id = latest_inst.loan_id 
         AND dc.installment_number = latest_inst.max_inst
        WHERE l.loan_type = :loanType
          AND l.file_number IN (:fileNumbers)
        GROUP BY l.id, l.file_number, dc.installment_number
        ORDER BY l.id
    """, nativeQuery = true)
    List<LoanWeeklySummaryProjection> findWeeklyMaxInstallmentSummary(@Param("loanType") String loanType, @Param("fileNumbers") List<String> fileNumbers);

    @Query("SELECT COALESCE(MAX(c.installmentNumber), 0) FROM DailyCollection c WHERE c.loan.id = :loanId")
    Integer findMaxInstallmentNumberByLoanId(@Param("loanId") Long loanId);

    boolean existsByLoanIdAndPaidAtBetween(Long loanId, LocalDateTime start, LocalDateTime end);
}

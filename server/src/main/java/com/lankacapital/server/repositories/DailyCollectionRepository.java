package com.lankacapital.server.repositories;

import com.lankacapital.server.dtos.CollectionReqDto;
import com.lankacapital.server.entities.DailyCollection;
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
}

package com.lankacapital.server.repositories;

import com.lankacapital.server.dtos.CollectionReqDto;
import com.lankacapital.server.entities.DailyCollection;
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

    @Query(value = """
    SELECT * FROM collection WHERE file_number = :fileNumber AND installment_number > :installmentNo ORDER BY installment_number ASC LIMIT 1
    """, nativeQuery = true)
    Optional<DailyCollection> findNextInstallment(
            @Param("fileNumber") String fileNumber,
            @Param("installmentNo") Integer installmentNo
    );

    DailyCollection findTopByOrderByInstallmentNumberDesc(String fileNumber);
    List<DailyCollection> findDailyCollectionByLoan_FileNumber(String fileNumber);
}

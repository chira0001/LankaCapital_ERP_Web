package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.DailyCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DailyCollectionRepository extends JpaRepository<DailyCollection, UUID> {

    List<DailyCollection> findByLoanFileNumberOrderByInstallmentNumberDesc(String fileNumber);
    List<DailyCollection> findByPaidAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

}

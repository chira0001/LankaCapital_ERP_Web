package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.DailyCollectionDue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DailyCollectionDueRepository extends JpaRepository<DailyCollectionDue, Long> {
}

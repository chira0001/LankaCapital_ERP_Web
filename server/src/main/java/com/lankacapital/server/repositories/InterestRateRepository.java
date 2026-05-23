package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.InterestRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterestRateRepository extends JpaRepository<InterestRate, Integer> {
}

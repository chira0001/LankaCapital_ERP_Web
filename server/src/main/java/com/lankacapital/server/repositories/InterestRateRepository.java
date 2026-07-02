package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.InterestRate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterestRateRepository extends JpaRepository<InterestRate, Integer> {
    @Query("SELECT s.id FROM InterestRate s")
    List<Integer> findAllCustomerIds();

    @Query("SELECT i FROM InterestRate i WHERE i.id IN :ids")
    List<InterestRate> findInterestRatesById(@Param("ids") List<Integer> ids, Pageable pageable);
}

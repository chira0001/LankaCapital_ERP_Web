package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Installment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, Double> {
    Installment findByValue(Integer value);
}

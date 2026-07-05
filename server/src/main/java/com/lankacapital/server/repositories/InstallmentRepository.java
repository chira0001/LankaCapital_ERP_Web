package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Installment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, Integer> {
    Installment findByValue(Integer value);

    @Query("SELECT s.id FROM Installment s")
    List<Integer> findAllInstallmentIds();

    @Query("SELECT i FROM Installment i WHERE i.id IN :ids")
    List<Installment> findInstallmentsByIdIn(@Param("ids") List<Integer> ids, Pageable pageable);
}

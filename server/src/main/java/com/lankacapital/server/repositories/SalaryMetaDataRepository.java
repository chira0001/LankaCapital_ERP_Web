package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.SalaryMetaData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryMetaDataRepository extends JpaRepository<SalaryMetaData, Integer> {
//    SalaryMetaData findByCategory(String category);
}

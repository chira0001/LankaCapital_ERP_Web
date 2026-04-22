package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.EmployeeMetaData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeMetaDataRepository extends JpaRepository<EmployeeMetaData, Integer> {
    EmployeeMetaData findByCategory(String category);
}

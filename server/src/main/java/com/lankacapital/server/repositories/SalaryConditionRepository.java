package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Role;
import com.lankacapital.server.entities.SalaryCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryConditionRepository extends JpaRepository<SalaryCondition, Integer> {
    Boolean existsByConditionName(String conditionName);
    SalaryCondition findByConditionName(String conditionName);
}

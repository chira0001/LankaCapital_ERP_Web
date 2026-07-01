package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.PettyCash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PettyCashRepository extends JpaRepository<PettyCash,Long> {
    List<PettyCash> findByRequestEmployee(Employee requestEmployee);
}

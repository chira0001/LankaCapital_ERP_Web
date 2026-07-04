package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.PettyCash;
import com.lankacapital.server.enums.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PettyCashRepository extends JpaRepository<PettyCash,Long> {
    List<PettyCash> findByRequestEmployee(Employee requestEmployee);
    List<PettyCash>findByRequest(Request request);
    List<PettyCash> findAllByRequestOrderByDateTimeDesc(Request request);
}

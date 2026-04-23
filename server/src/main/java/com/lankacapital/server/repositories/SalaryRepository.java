package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, Long> {
    Boolean existsByEmployeeAndMonth(Employee employee, String date);
}

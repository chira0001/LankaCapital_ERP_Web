package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Boolean existsByNic(Long nic);
    Employee findByEmail(String email);
    Boolean existsByEmail(String email);
    List<Employee> findByRoleIsNotNull();
}

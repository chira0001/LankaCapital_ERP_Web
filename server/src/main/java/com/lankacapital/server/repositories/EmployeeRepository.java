package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Employee;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Boolean existsByNic(Long nic);
    Employee findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT s.id FROM Employee s")
    List<Long> findAllFieldOfficersIds();

    @Query("""
       SELECT s FROM Employee s
       WHERE s.id IN :ids
       AND s.role.id IN (3,4)
       """)
    List<Employee> findFieldOfficersByIds(@Param("ids") List<Long> ids, Pageable pageable);
}

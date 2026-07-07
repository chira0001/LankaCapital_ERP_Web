package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Employee;
import org.springframework.data.domain.Page;
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

    @Query("SELECT e FROM Employee e WHERE e.id IN :ids AND e.role.id IN (3, 1, 2)")
    List<Employee> findCustomersByIds(@Param("ids") List<Long> ids);

    @Query("""
    SELECT e FROM Employee e WHERE e.role.id IN (3, 2)
    """)
    Page<Employee> findAllByRole(Pageable pageable);

    List<Employee> findByRoleIsNotNull();

}

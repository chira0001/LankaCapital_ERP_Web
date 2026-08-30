package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Boolean existsByNic(String nic);
    Employee findByEmail(String email);
    Boolean existsByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE e.id IN :ids AND e.role.id IN (1, 2, 3)")
    List<Employee> findCustomersByIds(@Param("ids") List<Long> ids);

    @Query("""
    SELECT e FROM Employee e WHERE e.role.id IN (1, 2, 3)
    """)
    Page<Employee> findAllByRole(Pageable pageable);

    List<Employee> findByRoleIsNotNull();

    @EntityGraph(attributePaths = {"role"})
    @Query("""
        select e
        from Employee e
        left join e.role r
        where e.deleted = false
          and lower(e.email) <> lower(:currentEmail)
          and (
                :search is null or :search = '' or
                lower(e.nic) like lower(concat('%', :search, '%')) or
                lower(e.firstName) like lower(concat('%', :search, '%')) or
                lower(e.lastName) like lower(concat('%', :search, '%')) or
                lower(e.email) like lower(concat('%', :search, '%')) or
                lower(coalesce(r.roleName, '')) like lower(concat('%', :search, '%'))
          )
    """)
    Page<Employee> findActiveEmployeesExceptEmail(
            @Param("currentEmail") String currentEmail,
            @Param("search") String search,
            Pageable pageable
    );

}

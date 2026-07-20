package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.loans")
    List<Customer> findAllWithLoans();

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.loans WHERE c.nic = :nic")
    Customer findByNicWithLoans(String nic);

    Boolean existsByNic(String nic);
    Customer findByNic(String nic);

    @Query("SELECT c FROM Customer c WHERE c.nic IN :nics")
    List<Customer> findCustomersByNics(@Param("nics") List<String> nics);

    List<Customer> findTop10ByNicStartingWith(String nic);
}

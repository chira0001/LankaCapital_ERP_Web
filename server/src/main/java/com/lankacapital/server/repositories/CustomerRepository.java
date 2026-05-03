package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.loans")
    List<Customer> findAllWithLoans();

    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.loans WHERE c.nic = :nic")
    Customer findByNicWithLoans(Long nic);

    Boolean existsByNic(Long nic);
    Customer findByNic(Long nic);
}

package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT c FROM Customer c WHERE c.nic IN :nics")
    List<Customer> findCustomersByNics(@Param("nics") List<Long> nics);

//    @Query("SELECT s.nic FROM Customer s")
//    List<Long> findAllCustomerIds();
//
//    @Query("SELECT s FROM Customer s WHERE s.nic IN :nic")
//    List<Customer> findCustomersByIds(@Param("nic") List<Long> nic, Pageable pageable);

//    @Query("SELECT c FROM Customer c WHERE c.updateStatus > 0")
//    List<Customer> findUpdatedCustomers(Pageable pageable);
}

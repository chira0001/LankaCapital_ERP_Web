package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}

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
public interface LoanRepository extends JpaRepository<Loan, String> {
    List<Loan> findAllByCustomer(Customer customer);
    Boolean existsByFileNumber(String fileNumber);
    Optional<Loan> findByFileNumber(String fileNumber);

    @Query("SELECT s.fileNumber FROM Loan s")
    List<String> findAllLoanIds();

    @Query("SELECT s FROM Loan s WHERE s.fileNumber IN :fileNumber")
    List<Loan> findLoansByIds(@Param("fileNumber") List<String> fileNumber, Pageable pageable);
}

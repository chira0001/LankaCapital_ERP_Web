package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
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

    @Query("SELECT s FROM Loan s WHERE s.fileNumber IN :fileNumber")
    List<Loan> findLoansByIds(@Param("fileNumber") List<String> fileNumber);

    @Query("""
    SELECT COUNT(l) FROM Loan l WHERE l.customer.nic = :nic AND (l.status IS NULL OR l.status <> :status)
    """)
        long countActiveLoans(@Param("nic") Long nic, @Param("status") LoanStatus status);
}

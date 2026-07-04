package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, String> {
    List<Loan> findAllByCustomer(Customer customer);
    Boolean existsByFileNumber(String fileNumber);
    Optional<Loan> findByFileNumber(String fileNumber);

    List<Loan> findByStatus(LoanStatus status);
    List<Loan> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM Loan l")
    BigDecimal sumTotalLoanAmount();

    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM Loan l WHERE l.status = 'ACTIVE'")
    BigDecimal sumOutstandingAmount();
}

package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.LoanType;
import org.springframework.data.domain.Pageable;
import com.lankacapital.server.enums.LoanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findAllByCustomer(Customer customer);
    Boolean existsByFileNumber(String fileNumber);
    Optional<Loan> findByFileNumber(String fileNumber);

    @Query("SELECT s FROM Loan s WHERE s.fileNumber IN :fileNumber")
    List<Loan> findLoansByIds(@Param("fileNumber") List<String> fileNumber);
    List<Loan> findByStatus(LoanStatus status);
    List<Loan> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM Loan l")
    BigDecimal sumTotalLoanAmount();

    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM Loan l WHERE l.status = 'ACTIVE'")
    BigDecimal sumOutstandingAmount();
    
    @Query("""
    SELECT COUNT(l) FROM Loan l WHERE l.customer.nic = :nic AND (l.status IS NULL OR l.status <> :status)
    """)
        long countActiveLoans(@Param("nic") String nic, @Param("status") LoanStatus status);

    List<Loan> findByLoanTypeOrderByIdDesc(LoanType loanType);
}

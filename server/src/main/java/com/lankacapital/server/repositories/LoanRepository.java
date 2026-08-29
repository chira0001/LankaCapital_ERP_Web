package com.lankacapital.server.repositories;

import com.lankacapital.server.dtos.LoanSummaryProjectionDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.LoanType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.lankacapital.server.enums.LoanStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
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
    SELECT COUNT(l) 
    FROM Loan l 
    WHERE l.customer.nic = :nic 
      AND (l.status IS NULL OR l.status IN :statuses)
    """)
    long countActiveLoans(
            @Param("nic") String nic,
            @Param("statuses") Collection<LoanStatus> statuses
    );

    List<Loan> findByLoanTypeOrderByIdDesc(LoanType loanType);

    @EntityGraph(attributePaths = {"customer", "approvedEmployee"})
    @Query("""
        select l from Loan l
        join l.customer c
        where l.status = :status
          and (
                :search is null or :search = '' or
                lower(l.fileNumber) like lower(concat('%', :search, '%')) or
                lower(c.name) like lower(concat('%', :search, '%')) or
                lower(c.nic) like lower(concat('%', :search, '%'))
          )
    """)
    Page<Loan> searchLoans(@Param("status") LoanStatus status,
                           @Param("search") String search,
                           Pageable pageable);

    @Query("""
    SELECT DISTINCT l
    FROM Loan l
    LEFT JOIN FETCH l.dailyCollections dc
    WHERE l.status = com.lankacapital.server.enums.LoanStatus.APPROVED
""")
    List<Loan> fetchApprovedLoansWithCollections();

    @EntityGraph(attributePaths = {"customer", "createdEmployee", "updatedEmployee", "approvedEmployee"})
    @Query("""
        select l
        from Loan l
        left join l.customer c
        where l.fileNumber is not null
          and (
                (:isReceptionist = true and l.fileNumber like '________-____-____-____-____________')
             or (:isReceptionist = false and l.fileNumber not like '________-____-____-____-____________')
          )
          and (
                :search is null or :search = '' or
                lower(l.fileNumber) like lower(concat('%', :search, '%')) or
                lower(c.nic) like lower(concat('%', :search, '%')) or
                lower(c.name) like lower(concat('%', :search, '%'))
          )
    """)
    Page<Loan> findLoansForRoleWithSearch(
            @Param("isReceptionist") boolean isReceptionist,
            @Param("search") String search,
            Pageable pageable
    );
}

package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.LoanSummaryResponseDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class LoanMapperTest {
    @Test
    void loanSummaryPreservesTheSignedSumOfOutstandingDueAmounts() {
        Loan loan = new Loan();
        loan.setAmount(new BigDecimal("30000.00"));
        loan.setInterestRate(20.0);
        loan.setInstallment(60);
        loan.setLoanType(LoanType.DAILY);

        Customer customer = new Customer();
        customer.setNic("123456789V");
        customer.setName("Test Customer");
        loan.setCustomer(customer);

        LoanSummaryResponseDto summary = LoanMapper.mapToLoanSummaryResponseDto(
                loan,
                new BigDecimal("600.00"),
                new BigDecimal("-1200.00")
        );

        assertEquals(new BigDecimal("-1200.00"), summary.getArrearsAmount());
    }

    @Test
    void loanSummaryHasNoArrearsWhenDueAmountsNetToZero() {
        Loan loan = new Loan();
        loan.setAmount(BigDecimal.ZERO);
        loan.setInstallment(0);
        loan.setLoanType(LoanType.DAILY);

        Customer customer = new Customer();
        customer.setNic("123456789V");
        customer.setName("Test Customer");
        loan.setCustomer(customer);

        LoanSummaryResponseDto summary = LoanMapper.mapToLoanSummaryResponseDto(
                loan,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );

        assertEquals(BigDecimal.ZERO, summary.getArrearsAmount());
    }

    @Test
    void loanResponseMapsEachEmployeeIndependently() {
        Loan loan = new Loan();
        loan.setId(10L);
        loan.setAmount(new BigDecimal("30000.00"));
        loan.setInterestRate(20.0);
        loan.setInstallment(60);

        Employee updater = new Employee();
        updater.setId(12L);
        updater.setFirstName("Updated");
        updater.setLastName("By");
        loan.setUpdatedEmployee(updater);

        Employee approver = new Employee();
        approver.setId(13L);
        approver.setFirstName("Approved");
        approver.setLastName("By");
        loan.setApprovedEmployee(approver);

        var response = LoanMapper.mapToLoanResponseDto(loan);

        assertEquals(10L, response.getId());
        assertNull(response.getEnteredBy());
        assertEquals(12L, response.getUpdatedBy().getId());
        assertEquals("Updated", response.getUpdatedBy().getFirstName());
        assertEquals(13L, response.getApprovedBy().getId());
        assertEquals("Approved", response.getApprovedBy().getFirstName());
    }

    @Test
    void loanResponseMapsCreatorWhenPresent() {
        Loan loan = new Loan();
        loan.setId(11L);
        loan.setAmount(new BigDecimal("30000.00"));
        loan.setInstallment(60);

        Employee creator = new Employee();
        creator.setId(11L);
        creator.setFirstName("Entered");
        creator.setLastName("By");
        loan.setCreatedEmployee(creator);

        var response = LoanMapper.mapToLoanResponseDto(loan);

        assertEquals(11L, response.getEnteredBy().getId());
        assertEquals("Entered", response.getEnteredBy().getFirstName());
    }
}

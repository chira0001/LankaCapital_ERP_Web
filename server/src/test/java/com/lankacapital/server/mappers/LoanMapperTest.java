package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.LoanSummaryResponseDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
}

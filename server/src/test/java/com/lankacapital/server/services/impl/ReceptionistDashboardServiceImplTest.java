package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.ReceptionistDto.ReceptionistDashboardStatsDto;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.repositories.CustomerRepository;
import com.lankacapital.server.repositories.LoanRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ReceptionistDashboardServiceImplTest {
    @Test
    void dashboardStatsUseCustomerAndLoanCountsFromRepositories() {
        CustomerRepository customerRepository = mock(CustomerRepository.class);
        LoanRepository loanRepository = mock(LoanRepository.class);
        when(customerRepository.countByDeletedFalse()).thenReturn(12L);
        when(loanRepository.countByStatus(LoanStatus.APPROVED)).thenReturn(5L);
        when(loanRepository.countByStatus(LoanStatus.COMPLETED)).thenReturn(7L);
        when(loanRepository.countByStatusAndCompletedAtBetween(
                eq(LoanStatus.COMPLETED),
                any(),
                any()
        )).thenReturn(2L);

        ReceptionistDashboardServiceImpl service =
                new ReceptionistDashboardServiceImpl(customerRepository, loanRepository);

        ReceptionistDashboardStatsDto stats = service.getDashboardStats();

        assertEquals(12L, stats.totalCustomers());
        assertEquals(5L, stats.activeLoans());
        assertEquals(2L, stats.completedToday());
        assertEquals(7L, stats.closedLoans());
    }
}

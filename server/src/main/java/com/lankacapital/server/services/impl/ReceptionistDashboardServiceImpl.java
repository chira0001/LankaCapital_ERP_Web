package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.ReceptionistDto.ReceptionistDashboardStatsDto;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.repositories.CustomerRepository;
import com.lankacapital.server.repositories.LoanRepository;
import com.lankacapital.server.services.ReceptionistDashboardService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
@AllArgsConstructor
public class ReceptionistDashboardServiceImpl implements ReceptionistDashboardService {
    private final CustomerRepository customerRepository;
    private final LoanRepository loanRepository;

    @Override
    public ReceptionistDashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();

        return new ReceptionistDashboardStatsDto(
                customerRepository.countByDeletedFalse(),
                loanRepository.countByStatus(LoanStatus.APPROVED),
                loanRepository.countByStatusAndCompletedAtBetween(
                        LoanStatus.COMPLETED,
                        today.atStartOfDay(),
                        today.atTime(LocalTime.MAX)
                ),
                loanRepository.countByStatus(LoanStatus.COMPLETED)
        );
    }
}

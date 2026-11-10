package com.lankacapital.server.dtos.ReceptionistDto;

public record ReceptionistDashboardStatsDto(
        long totalCustomers,
        long activeLoans,
        long completedToday,
        long closedLoans
) {
}

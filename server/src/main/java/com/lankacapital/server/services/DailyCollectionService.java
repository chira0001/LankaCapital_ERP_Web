package com.lankacapital.server.services;

import com.lankacapital.server.dtos.DailyCollectionDto;
import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.dtos.DailyCollectionSummaryDto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface DailyCollectionService {
    List<DailyCollectionResponseDto> getLoanCollectionDetailsByFileNumber(String fileNumber);

    // Revenue Tracking methods
    BigDecimal getTodayCollection();

    BigDecimal getWeeklyCollection();

    List<DailyCollectionDto> getAllCollections();

    DailyCollectionSummaryDto getDailyCollectionSummary(LocalDate date);
}

package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    List<DailyCollectionResponseDto> getDailyCollectionDetails(LocalDate date);

    DailyCollectionSummaryDto getDailyCollectionSummary(LocalDate date);


}

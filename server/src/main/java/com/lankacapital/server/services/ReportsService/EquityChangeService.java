package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.EquityChangeDto;

import java.time.LocalDate;
import java.util.List;

public interface EquityChangeService {

    String addEquityChange(List<EquityChangeDto> changeDtos);
    List<EquityChangeDto> fetchEquityChange(LocalDate startDate, LocalDate endDate);

}

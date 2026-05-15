package com.lankacapital.server.services;

import com.lankacapital.server.dtos.DailyCollectionResponseDto;

import java.util.List;

public interface DailyCollectionService {
    List<DailyCollectionResponseDto> getLoanCollectionDetailsByFileNumber(String fileNumber);
}

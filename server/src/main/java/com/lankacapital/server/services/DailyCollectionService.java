package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;

import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.entities.DailyCollection;

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
    String syncDailyCollection(String username, CollectionSyncDto collectionSyncDto);
    DailyCollection addDailyCollection(String username, CollectionRequestDto collectionDto);
    List<CollectionResDto> manageCollections(String username, List<CollectionReqDto> collectionReqDto);
}

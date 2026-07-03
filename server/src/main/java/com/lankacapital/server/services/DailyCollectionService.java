package com.lankacapital.server.services;

import com.lankacapital.server.dtos.CollectionRequestDto;
import com.lankacapital.server.dtos.CollectionSyncDto;
import com.lankacapital.server.dtos.CustomerRegisterDto;
import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.entities.DailyCollection;

import java.util.List;

public interface DailyCollectionService {
    List<DailyCollectionResponseDto> getLoanCollectionDetailsByFileNumber(String fileNumber);
    String syncDailyCollection(CollectionSyncDto collectionSyncDto);
    DailyCollection addDailyCollection(CollectionRequestDto collectionDto);
}

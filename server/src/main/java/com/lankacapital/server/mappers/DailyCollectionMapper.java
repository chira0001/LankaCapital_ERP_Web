package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.CollectionRequestDto;
import com.lankacapital.server.dtos.CollectionSyncDto;
import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.entities.DailyCollection;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public class DailyCollectionMapper {
    public static DailyCollectionResponseDto mapToDailyCollectionResponseDto(DailyCollection collection) {

        DailyCollectionResponseDto dto = new DailyCollectionResponseDto();

        dto.setId(collection.getId());
        dto.setInstallmentNumber(collection.getInstallmentNumber());
        dto.setPaidAmount(collection.getPaidAmount());
        dto.setPaidAt(collection.getPaidAt());
        dto.setEmployeeId(collection.getEmployee().getId());
        dto.setFileNumber(collection.getLoan().getFileNumber());

        return dto;
    }

    public static DailyCollection mapToSync(CollectionSyncDto dto) {
        DailyCollection collection = new DailyCollection();

        collection.setInstallmentNumber(dto.getInstallmentNumber());
        collection.setPaidAmount(dto.getPaidAmount());
        collection.setPaidAt(dto.getPaidAt());
        collection.setDueAmount(dto.getDueAmount());

        return collection;
    }

    public static DailyCollection mapToDailyCollection(CollectionRequestDto dto) {
        DailyCollection collection = new DailyCollection();

        collection.setInstallmentNumber(dto.getInstallmentNumber());
        collection.setPaidAmount(dto.getPaidAmount());
        collection.setDueAmount(dto.getDueAmount());
        collection.setPaidAt(Timestamp.valueOf(LocalDateTime.now()).toLocalDateTime());

        return collection;
    }
}

package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.entities.DailyCollection;

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
}

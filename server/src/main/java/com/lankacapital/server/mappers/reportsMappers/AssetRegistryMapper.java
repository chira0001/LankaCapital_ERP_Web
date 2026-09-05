package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.AssetsDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;

import java.time.LocalDate;

public class AssetRegistryMapper {

    public static AssetsRegistry mapToAssetsRegistry(AssetsDto assetsDto){
        AssetsRegistry assetsRegistry = new AssetsRegistry();

        assetsRegistry.setAssetName(assetsDto.getAssetName());
        assetsRegistry.setPurchasedDate(LocalDate.parse(assetsDto.getPurchasedMonth()));
        assetsRegistry.setDepreciatedDate(LocalDate.parse(assetsDto.getDepreciationMonth()));
        assetsRegistry.setRate(Double.valueOf(assetsDto.getRate()));
        assetsRegistry.setAmount(assetsDto.getAmount());

        return assetsRegistry;
    }

    public static AssetsDto mapToAssetsDto(AssetsRegistry assetsRegistry){
        AssetsDto dto = new AssetsDto();

        dto.setId(assetsRegistry.getId());
        dto.setAssetName(assetsRegistry.getAssetName());
        dto.setPurchasedMonth(assetsRegistry.getPurchasedDate().toString());
        dto.setDepreciationMonth(assetsRegistry.getDepreciatedDate().toString());
        dto.setRate(assetsRegistry.getRate().toString());
        dto.setAmount(assetsRegistry.getAmount());

        return dto;
    }
}

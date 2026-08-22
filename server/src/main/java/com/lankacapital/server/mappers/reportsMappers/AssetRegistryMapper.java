package com.lankacapital.server.mappers.reportsMappers;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.AssetsDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;

import java.time.LocalDate;

public class AssetRegistryMapper {

    public static AssetsRegistry mapToAssetsRegistry(AssetsDto assetsDto){
        AssetsRegistry assetsRegistry = new AssetsRegistry();

        assetsRegistry.setAssetName(assetsDto.getAssetName());
        assetsRegistry.setPurchasedDate(LocalDate.parse(assetsDto.getPurchasedMonth()));
        assetsRegistry.setRate(Double.valueOf(assetsDto.getRate()));
        assetsRegistry.setAmount(assetsDto.getAmount());

        return assetsRegistry;
    }

}

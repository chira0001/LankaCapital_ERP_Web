package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.AssetsDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;

import java.util.List;

public interface AssetsRegistryService {

    AssetsRegistry addAssetToRegistry(AssetsDto assetsDto);
    List<AssetsDto> getAllAssets();

}

package com.lankacapital.server.services.ReportsService;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.AssetsDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;

public interface AssetsRegistryService {

    AssetsRegistry addAssetToRegistry(AssetsDto assetsDto);

}

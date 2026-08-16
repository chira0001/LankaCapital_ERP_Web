package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.AssetsDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;
import com.lankacapital.server.mappers.reportsMappers.AssetRegistryMapper;
import com.lankacapital.server.repositories.ReportsRepository.AssetsRegistryRepository;
import com.lankacapital.server.services.ReportsService.AssetsRegistryService;
import org.springframework.stereotype.Service;

@Service
public class AssetsRegistryServiceImpl implements AssetsRegistryService {

    private AssetsRegistryRepository assetsRegistryRepository;

    @Override
    public AssetsRegistry addAssetToRegistry(AssetsDto assetsDto) {
        AssetsRegistry assetsRegistry = AssetRegistryMapper.mapToAssetsRegistry(assetsDto);
        return assetsRegistryRepository.save(assetsRegistry);
    }
}

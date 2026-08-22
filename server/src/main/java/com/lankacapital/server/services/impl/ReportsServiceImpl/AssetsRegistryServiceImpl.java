package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.AssetsDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;
import com.lankacapital.server.mappers.reportsMappers.AssetRegistryMapper;
import com.lankacapital.server.repositories.ReportsRepository.AssetsRegistryRepository;
import com.lankacapital.server.services.ReportsService.AssetsRegistryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AssetsRegistryServiceImpl implements AssetsRegistryService {

    private AssetsRegistryRepository assetsRegistryRepository;

    @Override
    public AssetsRegistry addAssetToRegistry(AssetsDto assetsDto) {
        AssetsRegistry assetsRegistry = AssetRegistryMapper.mapToAssetsRegistry(assetsDto);
        return assetsRegistryRepository.save(assetsRegistry);
    }

    @Override
    public List<AssetsDto> getAllAssets() {
        List<AssetsRegistry> assetsRegistries = assetsRegistryRepository.findAll();
        return assetsRegistries.stream().map(AssetRegistryMapper::mapToAssetsDto).toList();
    }
}

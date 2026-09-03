package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.FinancialNoteDataDto;
import com.lankacapital.server.entities.reports.AssetsRegistry;
import com.lankacapital.server.entities.reports.FinancialNoteData;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.reportsMappers.FinancialNoteDataMapper;
import com.lankacapital.server.repositories.ReportsRepository.AssetsRegistryRepository;
import com.lankacapital.server.repositories.ReportsRepository.FinancialNoteDataRepository;
import com.lankacapital.server.services.ReportsService.FinancialNoteDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FinancialNoteDataServiceImpl implements FinancialNoteDataService {

    private FinancialNoteDataRepository financialNoteDataRepository;
    private AssetsRegistryRepository assetsRegistryRepository;

    @Override
    @Transactional
    public String addFinancialNoteData(List<FinancialNoteDataDto> dataDtos) {

        if (dataDtos == null || dataDtos.isEmpty()) {
            return "Financial Data saved successfully"; // keep behavior safe (no-op)
        }

        Set<Long> assetIds = dataDtos.stream()
                .map(FinancialNoteDataDto::getAssetId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (assetIds.isEmpty()) {
            throw new ResourceNotFoundException("No asset found");
        }

        Map<Long, AssetsRegistry> assetsById = assetsRegistryRepository.findAllById(assetIds)
                .stream()
                .collect(Collectors.toMap(AssetsRegistry::getId, Function.identity()));

        List<Long> missingAssetIds = assetIds.stream()
                .filter(id -> !assetsById.containsKey(id))
                .toList();

        if (!missingAssetIds.isEmpty()) {
            throw new ResourceNotFoundException("No asset found for IDs: " + missingAssetIds);
        }

        List<FinancialNoteData> entities = dataDtos.stream()
                .map(dto -> FinancialNoteDataMapper.mapToFinancialNoteData(dto, assetsById.get(dto.getAssetId())))
                .toList();

        financialNoteDataRepository.saveAll(entities);

        return "Financial Data saved successfully";
    }
}

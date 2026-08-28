package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.TrialBalanceDataDto;
import com.lankacapital.server.entities.reports.TrialBalanceData;
import com.lankacapital.server.mappers.reportsMappers.TrialBalanceDataMapper;
import com.lankacapital.server.repositories.ReportsRepository.TrialBalanceDataRepository;
import com.lankacapital.server.services.ReportsService.TrialBalanceDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class TrialBalanceDataServiceImpl implements TrialBalanceDataService {

    private TrialBalanceDataRepository trialBalanceDataRepository;

    @Override
    public List<TrialBalanceDataDto> addToTrialBalance(List<TrialBalanceDataDto> trialBalanceDataDtos) {

        List<TrialBalanceData> balanceDataList = trialBalanceDataDtos
                .stream()
                .map(TrialBalanceDataMapper::mapToTrialBalanceData)
                .toList();

        return trialBalanceDataRepository.saveAll(balanceDataList)
                .stream()
                .map(TrialBalanceDataMapper::mapToTrialBalanceDataDto)
                .toList();
    }
}

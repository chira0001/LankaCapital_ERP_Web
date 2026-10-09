package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.CashFlowDataDto;
import com.lankacapital.server.entities.reports.CashFlowData;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.mappers.reportsMappers.CashFlowDataMapper;
import com.lankacapital.server.repositories.ReportsRepository.CashFlowDataRepository;
import com.lankacapital.server.services.ReportsService.CashFlowDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@AllArgsConstructor
public class CashFlowDataServiceImpl implements CashFlowDataService {
    private CashFlowDataRepository cashFlowDataRepository;


    @Override
    public CashFlowDataDto fetchCashFlow(LocalDate startDate, LocalDate endDate) {
        return CashFlowDataMapper.mapToCashFlowDataDto(cashFlowDataRepository.findByFinancialDateBetween(startDate,endDate));
    }

    @Override
    public String addCashFlow(CashFlowDataDto dto) {
        try {
            if(cashFlowDataRepository.existsByFinancialDate(dto.getFinancialDate())){
                throw new ResourceExistException("Cash Flow Data exist for selected Period");
            }
            cashFlowDataRepository.save(CashFlowDataMapper.mapToCashFlowData(dto));
            return "Cash Flow data saved Successfully";
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }
}

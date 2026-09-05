package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.EquityChangeDto;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.mappers.reportsMappers.EquityChangeMapper;
import com.lankacapital.server.repositories.ReportsRepository.EquityChangeRepository;
import com.lankacapital.server.services.ReportsService.EquityChangeService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class EquityChangeServiceImpl implements EquityChangeService {

    private EquityChangeRepository equityChangeRepository;

    @Override
    public String addEquityChange(List<EquityChangeDto> changeDtos) {
        try{
            if(equityChangeRepository.existsByFinancialDate(LocalDate.parse(changeDtos.getFirst().getFinancialDate()))){
                throw new ResourceExistException("Data exists for selected financial period");
            }
            equityChangeRepository.saveAll(changeDtos.stream().map(EquityChangeMapper::mapToEquityChange).toList());
            return "Successfully added data";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<EquityChangeDto> fetchEquityChange(LocalDate startDate, LocalDate endDate) {
        return equityChangeRepository.findByFinancialDateBetween(startDate,endDate)
                .stream()
                .map(EquityChangeMapper::mapToEquityChangeDto)
                .toList();
    }
}

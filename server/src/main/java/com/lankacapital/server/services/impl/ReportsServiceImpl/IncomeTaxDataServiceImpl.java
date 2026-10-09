package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.IncomeTaxDataDto;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.reportsMappers.IncomeTaxDataMapper;
import com.lankacapital.server.repositories.ReportsRepository.IncomeTaxDataRepository;
import com.lankacapital.server.services.ReportsService.IncomeTaxDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@AllArgsConstructor
public class IncomeTaxDataServiceImpl implements IncomeTaxDataService {

    private final IncomeTaxDataRepository incomeTaxDataRepository;

    @Override
    @Transactional
    public String addNoteIncomeTax(IncomeTaxDataDto dto) {
        if (dto == null || dto.getFinancialDate() == null) {
            throw new ResourceNotFoundException("financialDate is required");
        }

        // prevent duplicates for same period end date (performance + consistency)
        if (incomeTaxDataRepository.existsByFinancialDate(dto.getFinancialDate())) {
            return "Income Tax data already exists for this period";
        }

        incomeTaxDataRepository.save(IncomeTaxDataMapper.mapToIncomeTaxData(dto));
        return "Successfully saved the data";
    }

    @Transactional(readOnly = true)
    public IncomeTaxDataDto getIncomeTaxByFinancialDate(LocalDate financialDate) {
        return incomeTaxDataRepository.findTopByFinancialDate(financialDate)
                .map(IncomeTaxDataMapper::mapToIncomeTaxDataDto)
                .orElse(null);
    }
}

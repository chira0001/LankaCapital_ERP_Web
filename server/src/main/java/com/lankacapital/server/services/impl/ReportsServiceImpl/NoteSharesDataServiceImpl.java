package com.lankacapital.server.services.impl.ReportsServiceImpl;

import com.lankacapital.server.dtos.AdminDto.ReportsDtos.NoteSharesDataDto;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.reportsMappers.NoteSharesDataMapper;
import com.lankacapital.server.repositories.ReportsRepository.NoteSharesDataRepository;
import com.lankacapital.server.services.ReportsService.NoteSharesDataService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class NoteSharesDataServiceImpl implements NoteSharesDataService {

    private final NoteSharesDataRepository noteSharesDataRepository;

    @Override
    @Transactional
    public String addNoteSharesData(NoteSharesDataDto dto) {
        if (dto == null || dto.getFinancialDate() == null) {
            throw new ResourceNotFoundException("financialDate is required");
        }
        if (dto.getNumberOfShares() == null || dto.getNumberOfShares() < 0) {
            throw new ResourceNotFoundException("numberOfShares must be valid");
        }

        // If already exists, do not create duplicates (UI will lock anyway)
        if (noteSharesDataRepository.existsByFinancialDate(dto.getFinancialDate())) {
            return "Shares already added";
        }

        noteSharesDataRepository.save(NoteSharesDataMapper.mapToNoteSharesData(dto));
        return "Shares successfully added";
    }

    @Transactional(readOnly = true)
    public NoteSharesDataDto getNoteSharesData(java.time.LocalDate financialDate) {
        return noteSharesDataRepository
                .findTopByFinancialDate(financialDate)
                .map(NoteSharesDataMapper::mapToNoteSharesDataDto)
                .orElse(null);
    }
}
package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.DailyCollectionMapper;
import com.lankacapital.server.repositories.DailyCollectionRepository;
import com.lankacapital.server.services.DailyCollectionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class DailyCollectionServiceImpl implements DailyCollectionService {

    private final DailyCollectionRepository dailyCollectionRepository;

    @Override
    public List<DailyCollectionResponseDto> getLoanCollectionDetailsByFileNumber(String fileNumber) {
        List<DailyCollection> collections = dailyCollectionRepository.findByLoanFileNumberOrderByPaidAtDesc(fileNumber);

        if (collections.isEmpty()) {
            throw new ResourceNotFoundException("Loan " + fileNumber + " does not contain any collection");
        }

        return collections.stream()
                .map(DailyCollectionMapper::mapToDailyCollectionResponseDto)
                .collect(Collectors.toList());
    }
}
package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.CollectionRequestDto;
import com.lankacapital.server.dtos.CollectionSyncDto;
import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Installment;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.DailyCollectionMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.DailyCollectionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class DailyCollectionServiceImpl implements DailyCollectionService {

    private final DailyCollectionRepository dailyCollectionRepository;
    private final LoanRepository loanRepository;
//    private final InstallmentRepository installmentRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public List<DailyCollectionResponseDto> getLoanCollectionDetailsByFileNumber(String fileNumber) {
        List<DailyCollection> collections = dailyCollectionRepository.findByLoanFileNumberOrderByInstallmentNumberDesc(fileNumber);

        if (collections.isEmpty()) {
            throw new ResourceNotFoundException("Loan " + fileNumber + " does not contain any collection");
        }

        return collections.stream()
                .map(DailyCollectionMapper::mapToDailyCollectionResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public String syncDailyCollection(CollectionSyncDto collectionSyncDto){
        DailyCollection collection = DailyCollectionMapper.mapToSync(collectionSyncDto);

        Employee employee = employeeRepository
                .findById(collectionSyncDto.getEmployeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found")
                );
        collection.setEmployee(employee);

        Loan loan = loanRepository
                .findById(collectionSyncDto.getFileNumber())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found")
                );
        collection.setLoan(loan);

        DailyCollection saved = dailyCollectionRepository.save(collection);
        return saved.getId().toString();
    }

    @Override
    public DailyCollection addDailyCollection(CollectionRequestDto collectionDto){
        DailyCollection collection = DailyCollectionMapper.mapToDailyCollection(collectionDto);

        Employee employee = employeeRepository
                .findById(collectionDto.getEmployeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found")
                );
        collection.setEmployee(employee);

        Loan loan = loanRepository
                .findById(collectionDto.getFileNumber())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found")
                );
        collection.setLoan(loan);
        return dailyCollectionRepository.save(collection);
    }
}
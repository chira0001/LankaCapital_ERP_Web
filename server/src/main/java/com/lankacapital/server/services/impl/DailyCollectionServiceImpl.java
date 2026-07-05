package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.DailyCollectionDto;
import com.lankacapital.server.dtos.CollectionRequestDto;
import com.lankacapital.server.dtos.CollectionSyncDto;
import com.lankacapital.server.dtos.DailyCollectionResponseDto;
import com.lankacapital.server.dtos.DailyCollectionSummaryDto;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class DailyCollectionServiceImpl implements DailyCollectionService {

    private final DailyCollectionRepository dailyCollectionRepository;
    private final LoanRepository loanRepository;
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
    public BigDecimal getTodayCollection() {

        LocalDate today = LocalDate.now();

        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(23,59,59);

        List<DailyCollection> collections =
                dailyCollectionRepository.findByPaidAtBetween(start,end);

        return collections.stream()
                .map(DailyCollection::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public BigDecimal getWeeklyCollection() {

        LocalDate today = LocalDate.now();

        LocalDateTime start = today.minusDays(6).atStartOfDay();
        LocalDateTime end = today.atTime(23,59,59);

        List<DailyCollection> collections =
                dailyCollectionRepository.findByPaidAtBetween(start,end);

        return collections.stream()
                .map(DailyCollection::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public List<DailyCollectionDto> getAllCollections() {

        List<DailyCollection> collections = dailyCollectionRepository.findAll();

        List<DailyCollectionDto> dtoList = new ArrayList<>();

        for (DailyCollection collection : collections) {

            DailyCollectionDto dto = new DailyCollectionDto();

            dto.setFileNumber(collection.getLoan().getFileNumber());

            dto.setCustomerName(
                    collection.getLoan().getCustomer().getName()
            );

            dto.setOfficerName(
                    collection.getEmployee().getFirstName()
                            + " "
                            + collection.getEmployee().getLastName()
            );

            dto.setInstallmentNumber(
                    collection.getInstallmentNumber()
            );

            dto.setPaidAmount(
                    collection.getPaidAmount()
            );

            dto.setDueAmount(
                    collection.getDueAmount()
            );

            dto.setPaidAt(
                    collection.getPaidAt()
            );

            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public DailyCollectionSummaryDto getDailyCollectionSummary(LocalDate date) {

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<DailyCollection> list =
                dailyCollectionRepository.findByPaidAtBetween(start, end);

        BigDecimal total = list.stream()
                .map(DailyCollection::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DailyCollectionSummaryDto dto = new DailyCollectionSummaryDto();

        dto.setDate(date.toString());
        dto.setTotalCollected(total);
        dto.setTotalTransactions(list.size());

        if (!list.isEmpty() && list.get(0).getEmployee() != null) {
            dto.setOfficerName(
                    list.get(0).getEmployee().getFirstName()
            );
        }

        return dto;
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
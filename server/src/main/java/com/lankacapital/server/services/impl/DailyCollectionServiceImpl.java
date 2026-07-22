package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.DailyCollectionMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.DailyCollectionService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
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
    public String syncDailyCollection(String username, CollectionSyncDto collectionSyncDto){
        DailyCollection collection = DailyCollectionMapper.mapToSync(collectionSyncDto);

        Employee authEmployee = employeeRepository.findByEmail(username);
        if(authEmployee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }

        collection.setEmployee(authEmployee);

        Loan loan = loanRepository
                .findByFileNumber(collectionSyncDto.getFileNumber())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found")
                );
        collection.setLoan(loan);

        DailyCollection saved = dailyCollectionRepository.save(collection);
        return saved.getId().toString();
    }

    @Override
    public DailyCollection addDailyCollection(String username, CollectionRequestDto collectionDto){
        Employee employee = employeeRepository.findByEmail(username);
        if(employee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }

        Loan loan = loanRepository
                .findByFileNumber(collectionDto.getFileNumber())
                .orElseThrow(() ->
                        new ResourceNotFoundException("No loan found for file number: " + collectionDto.getFileNumber())
                );

        if(loan.getStatus() != LoanStatus.APPROVED){
            throw new ResourceExistException(
                    "This loan is currently: " + loan.getStatus().toString()
            );
        }

        Optional<DailyCollection> collections = dailyCollectionRepository.findFirstByLoan_FileNumberOrderByInstallmentNumberDesc(loan.getFileNumber());
        if(!collections.isEmpty()){
            if(collections.get().getInstallmentNumber() >= collectionDto.getInstallmentNumber()){
                throw new ResourceExistException(
                        "Invalid installment number: " + collectionDto.getInstallmentNumber()
                );
            }
        }
//        else if(collectionDto.getInstallmentNumber() != 0){
//
//        }
//        if(collections.get().getInstallmentNumber()+ 1 == collectionDto.getInstallmentNumber()){
//
//        }
        DailyCollection collection = DailyCollectionMapper.mapToDailyCollection(collectionDto);
        collection.setEmployee(employee);
        collection.setLoan(loan);

        return dailyCollectionRepository.save(collection);
    }

    @Override
    public List<CollectionResDto> manageCollections(String username, List<CollectionReqDto> collectionReqDto){
        Employee employee = employeeRepository.findByEmail(username);
        if(employee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }

        List<CollectionResDto> dtoList = new ArrayList<>();

        for (CollectionReqDto dto : collectionReqDto){
            Optional<Loan> loan = loanRepository.findByFileNumber(dto.getFileNumber());
            if(loan.isEmpty()){
                continue;
            }
            List<DailyCollection> collections = dailyCollectionRepository.findDailyCollectionByLoan_Id(loan.get().getId());
            if (collections == null || collections.isEmpty()) {
                continue;
            }
            DailyCollection lastCollection = collections.stream()
                    .max(Comparator.comparing(DailyCollection::getInstallmentNumber))
                    .orElse(null);

            if(lastCollection.getInstallmentNumber() <= dto.getInstallmentNo()){
                continue;
            }

            CollectionResDto collectionResDto = new CollectionResDto();

            BigDecimal totalDueAmount = collections.stream()
                    .map(DailyCollection::getDueAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPaidAmount = collections.stream()
                    .map(DailyCollection::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal scaledDueAmount = totalDueAmount.setScale(2, RoundingMode.HALF_UP);
            BigDecimal scaledTotalPaid = totalPaidAmount.setScale(2, RoundingMode.HALF_UP);

            collectionResDto.setDueAmount(scaledDueAmount.doubleValue());
            collectionResDto.setTotalPaid(scaledTotalPaid.doubleValue());
            collectionResDto.setInstallmentNo(lastCollection.getInstallmentNumber());
            collectionResDto.setFileNumber(lastCollection.getLoan().getFileNumber());

            dtoList.add(collectionResDto);
        }
        return dtoList;
    }
}
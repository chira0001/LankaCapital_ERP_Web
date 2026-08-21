package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.dtos.AdminDto.AdminDailyCollectionResponseDto;
import com.lankacapital.server.dtos.AdminDto.DailyCollectionRequestDto;
import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.LoanType;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.DailyCollectionMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.DailyCollectionService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
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
    public List<AdminDailyCollectionResponseDto> getDailyCollections(DailyCollectionRequestDto dailyCollectionRequestDto) {
        LocalDate start = LocalDate.parse(dailyCollectionRequestDto.getStartDate());
        LocalDate end = LocalDate.parse(dailyCollectionRequestDto.getEndDate());

        LocalDateTime startDate = start.atStartOfDay();
        LocalDateTime endDate = end.plusDays(1).atStartOfDay().minusSeconds(1);

        List<DailyCollection> collections = dailyCollectionRepository.findByPaidAtBetween(startDate, endDate);

        return collections.stream().map(DailyCollectionMapper::mapToAdminDailyCollectionResponseDto).toList();
    }

//    @Override
//    public DailyCollectionSummaryDto getDailyCollectionSummary(LocalDate date) {
//
//        LocalDateTime start = date.atStartOfDay();
//        LocalDateTime end = date.plusDays(1).atStartOfDay();
//
//        List<DailyCollection> list =
//                dailyCollectionRepository.findByPaidAtBetween(start, end);
//
//        BigDecimal total = list.stream()
//                .map(DailyCollection::getPaidAmount)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        DailyCollectionSummaryDto dto = new DailyCollectionSummaryDto();
//
//        dto.setDate(date.toString());
//        dto.setTotalCollected(total);
//        dto.setTotalTransactions(list.size());
//
//        if (!list.isEmpty() && list.get(0).getEmployee() != null) {
//            dto.setOfficerName(
//                    list.get(0).getEmployee().getFirstName()
//            );
//        }
//
//        return dto;
//    }

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

        if (loan.getStatus() != LoanStatus.APPROVED) {
            throw new ResourceExistException("This loan is currently: " + loan.getStatus());
        }

        Optional<DailyCollection> lastDailyCollection =
                dailyCollectionRepository.findFirstByLoan_FileNumberOrderByInstallmentNumberDesc(loan.getFileNumber());

        if (lastDailyCollection.isPresent()) {
            LocalDate lastDate = lastDailyCollection.get().getPaidAt().toLocalDate();
            LocalDate newDate = collectionSyncDto.getPaidAt().toLocalDate();

            if (loan.getLoanType().equals(LoanType.DAILY)) {
                if (!newDate.isAfter(lastDate)) {
                    throw new ResourceExistException("Daily collection date must be after " + lastDate + ", received: " + newDate);
                }
            } else if (loan.getLoanType().equals(LoanType.WEEKLY)) {
                if (newDate.isBefore(lastDate.plusWeeks(1))) {
                    throw new ResourceExistException("Weekly collection must be on or after " + lastDate.plusWeeks(1) + ", received: " + newDate);
                }
            }
        }

        collection.setLoan(loan);

        DailyCollection saved = dailyCollectionRepository.save(collection);
        return saved.getId().toString();
    }

    @Override
    @Transactional
    public DailyCollection addDailyCollection(String username, CollectionRequestDto collectionDto) {
        Employee employee = Optional.ofNullable(employeeRepository.findByEmail(username))
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found for username: " + username));

        Loan loan = loanRepository.findByFileNumber(collectionDto.getFileNumber())
                .orElseThrow(() -> new ResourceNotFoundException("No loan found for file number: " + collectionDto.getFileNumber()));

        if (loan.getStatus() != LoanStatus.APPROVED) {
            throw new ResourceExistException("This loan is currently: " + loan.getStatus());
        }

        Optional<DailyCollection> lastDailyCollection =
                dailyCollectionRepository.findFirstByLoan_FileNumberOrderByInstallmentNumberDesc(loan.getFileNumber());

        if (lastDailyCollection.isPresent()) {
            LocalDate lastDate = lastDailyCollection.get().getPaidAt().toLocalDate();
            LocalDate newDate = collectionDto.getPaidAt().toLocalDate();

            if (loan.getLoanType().equals(LoanType.DAILY)) {
                if (!newDate.isAfter(lastDate)) {
                    throw new ResourceExistException("Daily collection date must be after " + lastDate + ", received: " + newDate);
                }
            } else if (loan.getLoanType().equals(LoanType.WEEKLY)) {
                if (newDate.isBefore(lastDate.plusWeeks(1))) {
                    throw new ResourceExistException("Weekly collection must be on or after " + lastDate.plusWeeks(1) + ", received: " + newDate);
                }
            }
        }

        dailyCollectionRepository.findFirstByLoan_FileNumberOrderByInstallmentNumberDesc(loan.getFileNumber())
                .ifPresent(lastCollection -> {
                    if (lastCollection.getInstallmentNumber() >= collectionDto.getInstallmentNumber()) {
                        throw new ResourceExistException("Invalid installment number: " + collectionDto.getInstallmentNumber());
                    }
                });

        List<DailyCollection> collections = dailyCollectionRepository.findDailyCollectionByLoan_Id(loan.getId());

        BigDecimal currentPayment = Optional.ofNullable(collectionDto.getPaidAmount()).orElse(BigDecimal.ZERO);

        BigDecimal totalPaidAmount = collections.stream()
                .map(DailyCollection::getPaidAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLoan = totalPaidAmount.add(currentPayment);

        boolean isFinalInstallment = Objects.equals(loan.getInstallment(), collectionDto.getInstallmentNumber());
        boolean isFullyPaid = totalLoan.compareTo(loan.getAmount()) >= 0;

        if (isFinalInstallment && !isFullyPaid) {
            throw new ResourceExistException("Cannot close loan: Total paid amount (" + totalLoan + ") is less than required loan amount (" + loan.getAmount() + ")");
        }

        if (isFullyPaid) {
            loan.setUpdateStatus(loan.getUpdateStatus() + 1);
            loan.setStatus(LoanStatus.COMPLETED);
            loanRepository.save(loan);
        }

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
            collectionResDto.setPaidAt(lastCollection.getPaidAt());

            dtoList.add(collectionResDto);
        }
        return dtoList;
    }
}
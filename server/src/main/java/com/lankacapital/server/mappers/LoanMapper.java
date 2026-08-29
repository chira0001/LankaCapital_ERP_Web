package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.*;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.LoanType;
import com.lankacapital.server.utils.UtilityFunctions;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class LoanMapper {
    public static Loan mapToLoan(LoanCreateDto loanCreateDto){

        Loan loan = new Loan();

        if (loanCreateDto.getFileNumber().isEmpty()) {
            loan.setFileNumber(UUID.randomUUID().toString());
        } else {
            loan.setFileNumber(loanCreateDto.getFileNumber());
        }

        loan.setEndAt(LocalDate.parse(loanCreateDto.getEndAt()));
        loan.setInstallment(loanCreateDto.getNumberOfInstallments());
        loan.setInterestRate(loanCreateDto.getInterestRate());
        loan.setStatus(LoanStatus.PENDING);
        loan.setAmount(loanCreateDto.getLoanAmount());
        loan.setDocumentCharge(loanCreateDto.getDocumentCharge());
        loan.setLoanType(LoanType.valueOf(loanCreateDto.getLoanType()));
        return loan;
    }

    public static LoanResponseDto mapToLoanResponseDto(Loan loan) {

        LoanResponseDto responseDto = new LoanResponseDto();

        responseDto.setEndAt(loan.getEndAt());
//        responseDto.setFileNumber(UtilityFunctions.isValidUUID(loan.getFileNumber()) ? "File Number Pending" : loan.getFileNumber());
        responseDto.setFileNumber(loan.getFileNumber());
        responseDto.setAmount(loan.getAmount() != null ? loan.getAmount() : BigDecimal.ZERO);
        responseDto.setCreatedAt(loan.getCreatedAt());
        responseDto.setLoanType(loan.getLoanType().toString());
        responseDto.setNoOfInstallments(
                loan.getInstallment() != null
                        ? loan.getInstallment()
                        : 0
        );

        responseDto.setDocumentCharge(
                loan.getDocumentCharge() != null
                        ? loan.getDocumentCharge().doubleValue()
                        : 0.0
        );

        responseDto.setEnteredBy(
                loan.getCreatedEmployee() != null
                        ? EmployeeMapper.mapToEmployeeResponseDto(loan.getCreatedEmployee())
                        : EmployeeMapper.mapToEmployeeResponseDto(new Employee())
        );

        responseDto.setUpdatedBy(
                loan.getCreatedEmployee() != null
                        ? EmployeeMapper.mapToEmployeeResponseDto(loan.getUpdatedEmployee())
                        : EmployeeMapper.mapToEmployeeResponseDto(new Employee())
        );

        responseDto.setApprovedBy(
                loan.getCreatedEmployee() != null
                        ? EmployeeMapper.mapToEmployeeResponseDto(loan.getApprovedEmployee())
                        : EmployeeMapper.mapToEmployeeResponseDto(new Employee())
        );

        responseDto.setInterestRate(loan.getInterestRate() == null ? 0.0 : loan.getInterestRate());

//        responseDto.setInterestRate(loan.getInterestRate().getRate());
        responseDto.setStatus(loan.getStatus());
        responseDto.setDecisionNote(loan.getDecisionNote());
        responseDto.setCustomer(
                loan.getCustomer() != null
                        ? CustomerMapper.mapToCustomerResponseDto(loan.getCustomer())
                        : null
        );

        if (loan.getCustomer() != null) {
            CustomerInfoDto customerDto = new CustomerInfoDto();

            customerDto.setCustomerNIC(loan.getCustomer().getNic());
            customerDto.setBusinessName(loan.getCustomer().getName());
            customerDto.setBusinessEmail(loan.getCustomer().getEmail());
            customerDto.setBusinessAddress(loan.getCustomer().getAddress());
            customerDto.setContactNumber(loan.getCustomer().getPhoneNumber());
        }

        return responseDto;
    }

    public static LoanResAsyncDto mapToCustomerAsyncDto(Loan loan) {
        LoanResAsyncDto dto = new LoanResAsyncDto();

        dto.setFileNumber(loan.getFileNumber());
        dto.setAmount(loan.getAmount());
        dto.setCustomerId(loan.getCustomer().getNic());
        dto.setEmployeeId(loan.getCreatedEmployee().getId());
        dto.setCreatedAt(loan.getCreatedAt());
        dto.setDocumentCharge(loan.getDocumentCharge());
        dto.setDecisionNote(loan.getDecisionNote());
        dto.setStatus(loan.getStatus().toString());
        dto.setInstallment(loan.getInstallment());
        dto.setUpdateStatus(loan.getUpdateStatus());
        dto.setInterestRate(loan.getInterestRate());
        dto.setLoanType(loan.getLoanType().toString());

        return dto;
    }

    public static LoanResDto mapToLoanResDto(Loan loan) {
        LoanResDto dto = new LoanResDto();
        EmployeeResDto employee = new EmployeeResDto();

        employee.setFirstName(loan.getCreatedEmployee().getFirstName());
        employee.setLastName(loan.getCreatedEmployee().getLastName());
        employee.setPhoneNumber(loan.getCreatedEmployee().getPhoneNumber());

        dto.setFileNumber(loan.getFileNumber() != null ? loan.getFileNumber() : null);
        dto.setAmount(loan.getAmount() != null ? loan.getAmount() : BigDecimal.ZERO);
        dto.setCreatedAt(loan.getCreatedAt());
        dto.setDocumentCharge(loan.getDocumentCharge() != null
                ? loan.getDocumentCharge().doubleValue()
                : 0.0
        );
        dto.setStatus(loan.getStatus());
        dto.setDecisionNote(loan.getDecisionNote());
        dto.setInterestRate(loan.getInterestRate());
        dto.setInstallment(loan.getInstallment());
        dto.setEmployee(employee);
        dto.setLoanType(loan.getLoanType().toString());

        return dto;
    }

    public static Customer mapToNewCustomer(LoanRequestDto loanRequestDto){
        Customer customer = new Customer();

        customer.setNic(loanRequestDto.getCustomerId());
        customer.setName(loanRequestDto.getName());
        customer.setEmail(loanRequestDto.getEmail());
        customer.setAddress(loanRequestDto.getAddress());
        customer.setPhoneNumber(loanRequestDto.getPhoneNumber());

        return customer;
    }

    public static LoanCollectionDto mapToLoanCollectionDto(Loan loan) {
        LoanCollectionDto dto = new LoanCollectionDto();

        dto.setAmount(loan.getAmount().doubleValue());
        dto.setCreatedAt(loan.getCreatedAt());
        dto.setInterestRate(loan.getInterestRate());
        dto.setInstallment(loan.getInstallment());
        dto.setEnteredBy(loan.getCreatedEmployee().getId());
        dto.setLoanType(loan.getLoanType().toString());
        dto.setCustomerNic(loan.getCustomer().getNic());
        dto.setCustomerName(loan.getCustomer().getName());
        dto.setCustomerAddress(loan.getCustomer().getAddress());

        return dto;
    }

    public static LoanSummaryResponseDto mapToLoanSummaryResponseDto(Loan loan) {
        LoanSummaryResponseDto dto = new LoanSummaryResponseDto();

        // Basic fields
        dto.setAmount(loan.getAmount());
        dto.setCreatedAt(loan.getCreatedAt());
        dto.setFileNumber(loan.getFileNumber());
        dto.setInstallment(loan.getInstallment());
        dto.setInterestRate(loan.getInterestRate());
        dto.setApprovedEmployee(EmployeeMapper.mapToEmployeeResponseDto(loan.getApprovedEmployee()));
        dto.setCustomer(CustomerMapper.mapToCustomerResponseDto(loan.getCustomer()));
        dto.setLoanType(loan.getLoanType());
        dto.setEndAt(loan.getEndAt());

        // Interest and total amount with interest
        BigDecimal interestRate = loan.getInterestRate() != null
                ? BigDecimal.valueOf(loan.getInterestRate())
                : BigDecimal.ZERO;

        BigDecimal amount = loan.getAmount() != null ? loan.getAmount() : BigDecimal.ZERO;
        BigDecimal totalWithInterest = amount
                .add(amount.multiply(interestRate)
                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));

        // Total paid from daily collections
        List<DailyCollection> collections = loan.getDailyCollections();
        collections = collections != null ? collections : List.of();

        BigDecimal totalPaid = collections.stream()
                .map(DailyCollection::getPaidAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        dto.setRemainingBalance(totalWithInterest.subtract(totalPaid));

        // Installment value
        BigDecimal installmentValue = BigDecimal.ZERO;
        if (loan.getInstallment() != null && loan.getInstallment() > 0) {
            installmentValue = totalWithInterest.divide(
                    BigDecimal.valueOf(loan.getInstallment()),
                    2,
                    RoundingMode.HALF_UP
            );
        }
        dto.setInstallmentValue(installmentValue);

        // Sort collections by installment number (required for mapping order)
        List<DailyCollection> sortedCollections = collections.stream()
                .sorted(Comparator.comparing(DailyCollection::getInstallmentNumber,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();

        dto.setDailyCollection(sortedCollections.stream()
                .map(DailyCollectionMapper::mapToDailyCollectionResponseDto)
                .toList());

        // ------------------ Arrears Calculation (Optimised) ------------------
        // Count how many installments have actually been paid (paidAt != null)
        long paidPeriods = collections.stream()
                .filter(dc -> dc.getPaidAt() != null)
                .count();

        BigDecimal dueAmountTotal = collections.stream()
                .map(dc -> dc.getDueAmount() == null ? BigDecimal.ZERO : dc.getDueAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Determine elapsed periods (days for DAILY, weeks for WEEKLY)
        long elapsedPeriods = 0;
        LocalDate startDate = loan.getCreatedAt() != null
                ? loan.getCreatedAt().toLocalDate()
                : LocalDate.now();

        if (loan.getLoanType() != null) {
            switch (loan.getLoanType()) {
                case DAILY:
                    elapsedPeriods = ChronoUnit.DAYS.between(startDate, LocalDate.now());
                    break;
                case WEEKLY:
                    elapsedPeriods = ChronoUnit.WEEKS.between(startDate, LocalDate.now());
                    break;
                default:
                    // No periodic arrears for other loan types
                    break;
            }
        }

        // Arrears = (elapsed - paid) * installmentValue, but never negative
        BigDecimal unpaidPeriods = BigDecimal.valueOf(Math.max(0, elapsedPeriods - paidPeriods));
        BigDecimal arrearsAmount = unpaidPeriods.multiply(installmentValue).subtract(dueAmountTotal);
        dto.setArrearsAmount(arrearsAmount);

        return dto;
    }

//    public static LoanSummaryResponseDto mapToLoanSummaryResponseDto(Loan loan){
//
//        LoanSummaryResponseDto dto = new LoanSummaryResponseDto();
//
//        dto.setAmount(loan.getAmount());
//        dto.setCreatedAt(loan.getCreatedAt());
//        dto.setFileNumber(loan.getFileNumber());
//        dto.setInstallment(loan.getInstallment());
//        dto.setInterestRate(loan.getInterestRate());
//        dto.setApprovedEmployee(
//                EmployeeMapper.mapToEmployeeResponseDto(loan.getApprovedEmployee())
//        );
//        dto.setCustomer(
//                CustomerMapper.mapToCustomerResponseDto(loan.getCustomer())
//        );
//        dto.setLoanType(loan.getLoanType());
//        dto.setEndAt(loan.getEndAt());
//
//        // ✅ Safe interest calculation
//        BigDecimal interestRate = loan.getInterestRate() != null
//                ? BigDecimal.valueOf(loan.getInterestRate())
//                : BigDecimal.ZERO;
//
//        BigDecimal totalWithInterest = loan.getAmount()
//                .add(loan.getAmount()
//                        .multiply(interestRate)
//                        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
//
//        BigDecimal totalPaid = loan.getDailyCollections().stream()
//                .map(DailyCollection::getPaidAmount)
//                .filter(Objects::nonNull)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//        dto.setRemainingBalance(totalWithInterest.subtract(totalPaid)); // <--- require sum of all collections
//
//        // ✅ Installment value
//        if (loan.getInstallment() != null && loan.getInstallment() > 0) {
//            dto.setInstallmentValue(
//                    totalWithInterest.divide(
//                            BigDecimal.valueOf(loan.getInstallment()),
//                            2,
//                            RoundingMode.HALF_UP
//                    )
//            );
//        }
//
//        // ✅ Handle Daily Collections safely
//        List<DailyCollection> collections = loan.getDailyCollections();
//        if (collections != null && !collections.isEmpty()) {
//
//            // ✅ Sort by installment number (important!)
//            collections.sort(Comparator.comparing(DailyCollection::getInstallmentNumber));
//
//            // ✅ Get max installment number
//            Integer maxInstallmentNumber = collections.stream()
//                    .map(DailyCollection::getInstallmentNumber)
//                    .max(Integer::compareTo)
//                    .orElse(0);
//
//            // ✅ Sum of all due amounts
//            BigDecimal totalDueAmount = collections.stream()
//                    .map(dc -> dc.getDueAmount() != null ? dc.getDueAmount() : BigDecimal.ZERO)
//                    .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//            if (dto.getInstallmentValue() != null) {
//                dto.setArrearsAmount(totalDueAmount);
//            }else{
//                dto.setInstallmentValue(BigDecimal.ZERO);
//            }
//
//            dto.setDailyCollection(
//                    collections.stream()
//                            .map(DailyCollectionMapper::mapToDailyCollectionResponseDto)
//                            .toList()
//            );
//        }
//        BigDecimal installmentValue = totalWithInterest.divide(
//                BigDecimal.valueOf(loan.getInstallment()),
//                2,
//                RoundingMode.HALF_UP
//        );
//
//        if(loan.getLoanType().equals("DAILY")){
//            int totalDays = LocalDate.now() - loan.getCreatedAt();
//            int totalPaidDays = collections.stream().map(dailyCollection -> dailyCollection.getPaidAt().count);
//
//            BigDecimal arrearsAmount = BigDecimal.valueOf(totalDays).subtract(BigDecimal.valueOf(totalPaidDays)).multiply(installmentValue);
//            dto.setArrearsAmount(arrearsAmount);
//        } else if (loan.getLoanType().equals("WEEKLY")) {
//            int totalWeeks = LocalDate.now() - loan.getCreatedAt();
//            int totalPaidWeeks = collections.stream().map(dailyCollection -> dailyCollection.getPaidAt().count);
//
//            BigDecimal arrearsAmount = BigDecimal.valueOf(totalWeeks).subtract(BigDecimal.valueOf(totalPaidWeeks)).multiply(installmentValue);
//            dto.setArrearsAmount(arrearsAmount);
//        }
//        else {
//            dto.setArrearsAmount(BigDecimal.ZERO);
//        }
//        return dto;
//    }
}


package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.dtos.Common.PageResponse;
import com.lankacapital.server.dtos.ReceptionistDto.RecepLoanUpdateDto;
import com.lankacapital.server.entities.Loan;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public interface LoanService {

    BigDecimal getApprovedLoanTotal();
    Loan addLoan(LoanCreateDto loanCreateDto, String username);
    String fetchLastFileNumber(String loanType);
    CustomerResponseDto getLoansByCustomerId(String id);

    Loan addLoanToExistingCustomer(String username, FieldOfficerLoanCreateDto loanCreateDto);

//    List<LoanResponseDto> getAllLoans(String username);
    PageResponse<LoanResponseDto> getAllLoans(String username, int page, int size, String search);


    LoanResponseDto getLoan(String fileNumber);

    LoanResponseDto updateLoan(String username, LoanUpdateDto loanUpdateDto, String fileNumber);
    LoanResponseDto recepUpdateLoan(String username, RecepLoanUpdateDto recepLoanUpdateDto, String fileNumber);

    //interest update
    LoanResponseDto updateInterest(InterestUpdateDTO dto, String username);

    //get interest
    LoanResponseDto getInterest(String fileNumber);

    //reset interest
    LoanResponseDto resetInterest(String fileNumber);

    List<LoanResAsyncDto> findAllLoansById(String username, LoanAsyncDto fileNoLis);

    Loan addLoanByFieldOfficer(String username, LoanRequestDto loanRequestDto);

    String addNewLoanByOfficer(String username, CustomerAddDto customerAddDto);

    List<LoanReportRow> getMonthlyLoanReport(YearMonth month);

    List<LoanManageDto> manageLoans(String username, int page);

    LoanCollectionDto getLoanInfoByFileNumber(String username, String fileNumber);

//    List<LoanSummaryResponseDto> fetchLoanSummary();

    PageResponse<LoanSummaryResponseDto> fetchLoanSummary(int page, int size, String search);
    PageResponse<DailyCollectionResponseDto> fetchLoanPayments(Long loanId, int page, int size);


}




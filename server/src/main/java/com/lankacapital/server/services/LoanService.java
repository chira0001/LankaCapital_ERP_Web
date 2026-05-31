package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Loan;
import jakarta.transaction.Transactional;

import java.util.List;

public interface LoanService {

    Loan addLoan(LoanCreateDto loanCreateDto);

    CustomerResponseDto getLoansByCustomerId(String id);
    //List<LoanResponseDto> getLoansByCustomerId(String id);

    Loan addLoanToExistingCustomer(FieldOfficerLoanCreateDto loanCreateDto);

    List<LoanResponseDto> getAllLoans();

    LoanResponseDto getLoan(String fileNumber);


    //approve loan
    @Transactional
    Loan approveLoan(LoanActionDto dto);

    @Transactional
    Loan rejectLoan(LoanActionDto dto);

    @Transactional
    Loan resetLoan(LoanActionDto dto);


    //interest update
    LoanResponseDto updateInterest(InterestUpdateDTO dto);

    //get interest
    LoanResponseDto getInterest(String fileNumber);

    //reset interest
    LoanResponseDto resetInterest(String fileNumber);

    List<LoanResAsyncDto> findAllLoansById(LoanAsyncDto fileNoLis, int page);

    Loan addLoanByFieldOfficer(LoanRequestDto loanRequestDto);

}




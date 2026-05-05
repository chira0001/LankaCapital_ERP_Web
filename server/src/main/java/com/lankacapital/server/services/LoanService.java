package com.lankacapital.server.services;

import com.lankacapital.server.dtos.LoanActionDto;
import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.Loan;
import jakarta.transaction.Transactional;

import java.util.List;

public interface LoanService {

    Loan addLoan(LoanCreateDto loanCreateDto);
    List<LoanResponseDto> getLoansByCustomerId(String id);

    List<LoanResponseDto> getAllLoans();
    LoanResponseDto getLoan(String fileNumber);
    //approve loan


    @Transactional
    Loan approveLoan(LoanActionDto dto);

    @Transactional
    Loan rejectLoan(LoanActionDto dto);
}

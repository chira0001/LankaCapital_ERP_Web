package com.lankacapital.server.services;

import com.lankacapital.server.dtos.FieldOfficerLoanCreateDto;
import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.Loan;

import java.util.List;

public interface LoanService {

    Loan addLoan(LoanCreateDto loanCreateDto);
    List<LoanResponseDto> getLoansByCustomerId(String id);
    void addLoanToExistingCustomer(FieldOfficerLoanCreateDto loanCreateDto);

}

package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;

public class LoanMapper {
    public static Loan mapToLoan(LoanCreateDto loanCreateDto){

        Loan loan = new Loan();

        loan.setFileNumber(loanCreateDto.getFileNumber());
        loan.setAmount(loanCreateDto.getLoanAmount());
        loan.setInterestRate(loanCreateDto.getInterestRate());
        loan.setDocumentCharge(loanCreateDto.getDocumentCharge());

        return loan;
    }

    public static LoanResponseDto mapToLoanResponseDto(Loan loan){
        LoanResponseDto responseDto = new LoanResponseDto();

        responseDto.setFileNumber(loan.getFileNumber());
        responseDto.setInterestRate(loan.getInterestRate());
        responseDto.setAmount(loan.getAmount().toString());
        responseDto.setCreatedAt(loan.getCreatedAt());
        responseDto.setNoOfInstallments(loan.getNumberOfInstallments().getValue());
        responseDto.setDocumentCharge(loan.getDocumentCharge().toBigInteger().doubleValue());
        responseDto.setEmployeeId(loan.getEmployeeId().getId());
        responseDto.setCustomerId(loan.getCustomer().getNic());

        return responseDto;
    }

    public static Customer mapToCustomer(LoanCreateDto loanCreateDto){
        Customer customer = new Customer();

        customer.setNic(loanCreateDto.getCustomerId());
        customer.setName(loanCreateDto.getName());
        customer.setEmail(loanCreateDto.getEmail());
        customer.setAddress(loanCreateDto.getAddress());
        customer.setPhoneNumber(loanCreateDto.getPhoneNumber());

        return customer;
    }

}

package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Installment;
import com.lankacapital.server.entities.InterestRate;
import com.lankacapital.server.entities.Loan;

import java.math.BigDecimal;

public class LoanMapper {
    public static Loan mapToLoan(LoanCreateDto loanCreateDto){

        Loan loan = new Loan();

        loan.setFileNumber(loanCreateDto.getFileNumber());
        loan.setAmount(loanCreateDto.getLoanAmount());
        loan.setDocumentCharge(loanCreateDto.getDocumentCharge());

        return loan;
    }


    public static LoanResponseDto mapToLoanResponseDto(Loan loan) {

        LoanResponseDto responseDto = new LoanResponseDto();

        responseDto.setFileNumber(loan.getFileNumber());
        responseDto.setAmount(loan.getAmount() != null ? loan.getAmount() : BigDecimal.ZERO);
        responseDto.setCreatedAt(loan.getCreatedAt());

        responseDto.setNoOfInstallments(
                loan.getInstallment() != null
                        ? loan.getInstallment().getValue()
                        : 0
        );

        responseDto.setDocumentCharge(
                loan.getDocumentCharge() != null
                        ? loan.getDocumentCharge().doubleValue()
                        : 0.0
        );

        responseDto.setEmployeeId(
                loan.getEmployee() != null
                        ? loan.getEmployee().getId()
                        : null
        );

        if (loan.getInterestRate() == null) {
            throw new RuntimeException("Interest rate missing for loan: " + loan.getFileNumber());
        }

        responseDto.setInterestRate(loan.getInterestRate().getRate());
        responseDto.setStatus(loan.getStatus());
        responseDto.setRejectionNote(loan.getDecisionNote());
        responseDto.setApplicantName(
                loan.getCustomer() != null
                        ? loan.getCustomer().getName()
                        : null
        );

        responseDto.setCustomerId(
                loan.getCustomer() != null
                        ? loan.getCustomer().getNic()
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

    public static Customer mapToCustomer(LoanCreateDto loanCreateDto){
        Customer customer = new Customer();

        customer.setNic(loanCreateDto.getCustomerId());
        customer.setName(loanCreateDto.getName());
        customer.setEmail(loanCreateDto.getEmail());
        customer.setAddress(loanCreateDto.getAddress());
        customer.setPhoneNumber(loanCreateDto.getPhoneNumber());

        customer.setBank(loanCreateDto.getBank());
        customer.setBankAccount(loanCreateDto.getBankAccount());

        return customer;
    }

    public static LoanResAsyncDto mapToCustomerAsyncDto(Loan loan) {
        LoanResAsyncDto dto = new LoanResAsyncDto();

        dto.setFile_number(loan.getFileNumber());
        dto.setAmount(loan.getAmount());
        dto.setCustomer_id(loan.getCustomer().getNic());
        dto.setEmployee_id(loan.getEmployee().getId());
        dto.setCreated_at(loan.getCreatedAt());
        dto.setDocument_charge(loan.getDocumentCharge());
        dto.setStatus(loan.getStatus().toString());
        dto.setInstallment_id(loan.getInstallment().getId());
        dto.setUpdate_status(loan.getUpdateStatus());
        dto.setInterest_rate_id(loan.getInterestRate() != null
                ? loan.getInterestRate().getId()
                : new InterestRate().getId()
        );

        return dto;
    }

    public static LoanResDto mapToLoanResDto(Loan loan) {
        LoanResDto dto = new LoanResDto();
        EmployeeResDto employee = new EmployeeResDto();
        InstallmentResDto installment = new InstallmentResDto();
        InterestRateResDto interestRate = new InterestRateResDto();

        employee.setFirstName(loan.getEmployee().getFirstName());
        employee.setLastName(loan.getEmployee().getLastName());
        employee.setPhoneNumber(loan.getEmployee().getPhoneNumber());

        installment.setValue(loan.getInstallment().getValue());
        interestRate.setRate(loan.getInterestRate() != null
                ? loan.getInterestRate().getRate()
                : 0.0
        );

        dto.setFileNumber(loan.getFileNumber() != null ? loan.getFileNumber() : null);
        dto.setAmount(loan.getAmount() != null ? loan.getAmount() : BigDecimal.ZERO);
        dto.setCreatedAt(loan.getCreatedAt());
        dto.setDocumentCharge(loan.getDocumentCharge() != null
                ? loan.getDocumentCharge().doubleValue()
                : 0.0
        );
        dto.setStatus(loan.getStatus());
        dto.setInterestRate(interestRate);
        dto.setInstallments(installment);
        dto.setEmployee(employee);


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
}


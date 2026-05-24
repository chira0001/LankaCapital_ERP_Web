package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.CustomerInfoDto;
import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.Customer;
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

        responseDto.setAmount(
                loan.getAmount() != null ? loan.getAmount() : BigDecimal.ZERO
        );

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
        responseDto.setInterestRate(loan.getInterestRate().getRate());

        responseDto.setStatus(loan.getStatus());

        if (loan.getCustomer() != null) {
            CustomerInfoDto customerDto = new CustomerInfoDto();

            customerDto.setCustomerNIC(loan.getCustomer().getNic());
            customerDto.setBusinessName(loan.getCustomer().getName());
            customerDto.setBusinessEmail(loan.getCustomer().getEmail());
            customerDto.setBusinessAddress(loan.getCustomer().getAddress());
            customerDto.setContactNumber(loan.getCustomer().getPhoneNumber());

            //responseDto.setCustomer(customerDto);
        }

        return responseDto;
    }
    /*
    public static LoanResponseDto mapToLoanResponseDto(Loan loan){
        LoanResponseDto responseDto = new LoanResponseDto();

        responseDto.setFileNumber(loan.getFileNumber());
        responseDto.setInterestRate(loan.getInterestRate());
        responseDto.setAmount(loan.getAmount().toString());
        responseDto.setCreatedAt(loan.getCreatedAt());
        responseDto.setNoOfInstallments(loan.getNumberOfInstallments().getValue());
        responseDto.setDocumentCharge(loan.getDocumentCharge().toBigInteger().doubleValue());
        responseDto.setEmployeeId(loan.getEmployee().getId());
        responseDto.setCustomerId(loan.getCustomer().getNic());
        responseDto.setStatus(loan.getStatus());
       // responseDto.setCustomerId(loan.getCustomer().getNic());

        if (loan.getCustomer() != null) {

            CustomerInfoDto customerDto = new CustomerInfoDto();

            customerDto.setCustomerNIC(loan.getCustomer().getNic());
            customerDto.setBusinessName(loan.getCustomer().getName());
            customerDto.setBusinessEmail(loan.getCustomer().getEmail());
            customerDto.setBusinessAddress(loan.getCustomer().getAddress());
            customerDto.setContactNumber(loan.getCustomer().getPhoneNumber());

            responseDto.setCustomer(customerDto);
        }



        return responseDto;
    }
    */

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

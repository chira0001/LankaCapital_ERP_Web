package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Customer;
import lombok.AllArgsConstructor;

import java.util.List;

@AllArgsConstructor
public class CustomerMapper {

    public static Customer mapToCustomer(CustomerRegisterDto customerRegisterDto){
        Customer customer = new Customer();

        customer.setNic(customerRegisterDto.getNic());
        customer.setName(customerRegisterDto.getName());
        customer.setEmail(customerRegisterDto.getEmail());
        customer.setAddress(customerRegisterDto.getAddress());
        customer.setPhoneNumber(customerRegisterDto.getPhoneNumber());
        customer.setBank(customerRegisterDto.getBank());
        customer.setBankAccount(customerRegisterDto.getBankAccount());

        return customer;
    }

   /* public static CustomerResponseDto mapToCustomerResponseDto(Customer customer){

        CustomerResponseDto dto = new CustomerResponseDto();
        List<LoanResponseDto> loans = customer.getLoans() == null ? List.of() :
                customer.getLoans().stream()
                        .map(loan -> new LoanResponseDto(
                                loan.getFileNumber(),
                                loan.getInterestRate(),
                                loan.getAmount().toString(),
                                loan.getCreatedAt(),
                                loan.getNumberOfInstallments().getValue(),
                                loan.getDocumentCharge().doubleValue(),
                                loan.getEmployee().getId(),
                                loan.getCustomer().getNic()
                        ))
                        .toList();
//                        .map(loan -> new LoanResponseDto(
//                                loan.getFileNumber(),
//                                loan.getInterestRate(),
//                                loan.getAmount().toString(),
//                                loan.getCreatedAt(),
//                                loan.getNumberOfInstallments().getValue(),
//                                loan.getDocumentCharge().doubleValue(),
//                                loan.getEmployeeId().getId(),
//                                loan.getCustomer().getNic()
//                        ))
//                        .toList();



        dto.setNic(customer.getNic());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setLoans(loans);
        dto.setRole(customer.getRole());

        return dto;
    }

    public static CustomerRegisterDto mapToCustomerRegisterDto(Customer customer){
        CustomerRegisterDto dto = new CustomerRegisterDto();
        dto.setNic(customer.getNic());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        dto.setPhoneNumber(customer.getPhoneNumber());
        return dto;
    }
}


    */

    public static CustomerResponseDto mapToCustomerResponseDto(Customer customer) {

        CustomerResponseDto dto = new CustomerResponseDto();

        List<LoanResponseDto> loans = customer.getLoans() == null ? List.of() :
                customer.getLoans().stream()
                        .map(loan -> {
                            LoanResponseDto loanDto = new LoanResponseDto();

                            loanDto.setFileNumber(loan.getFileNumber());
                            loanDto.setInterestRate(loan.getInterestRate().getRate());
                            loanDto.setAmount(loan.getAmount());
                            loanDto.setCreatedAt(loan.getCreatedAt());
                            loanDto.setNoOfInstallments(loan.getInstallment().getValue());
                            loanDto.setDocumentCharge(loan.getDocumentCharge().doubleValue());
                            loanDto.setEmployeeId(loan.getEmployee().getId());
                            loanDto.setStatus(loan.getStatus());

                            // CUSTOMER INFO INSIDE LOAN
                            CustomerInfoDto customerDto = new CustomerInfoDto();
                            customerDto.setCustomerNIC(loan.getCustomer().getNic());
                            customerDto.setBusinessName(loan.getCustomer().getName());
                            customerDto.setBusinessEmail(loan.getCustomer().getEmail());
                            customerDto.setBusinessAddress(loan.getCustomer().getAddress());
                            customerDto.setContactNumber(loan.getCustomer().getPhoneNumber());

                            //loanDto.setCustomer(customerDto);

                            return loanDto;
                        })
                        .toList();

        dto.setNic(customer.getNic());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setLoans(loans);
        dto.setRole(customer.getRole());
        dto.setBank(customer.getBank());
        dto.setBankAccount(customer.getBankAccount());

        return dto;
    }

    public static CustomerResAsyncDto mapToCustomerAsyncDto(Customer customer) {
        CustomerResAsyncDto dto = new CustomerResAsyncDto();
        dto.setNic(customer.getNic());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setAddress(customer.getAddress());
        dto.setPhone_number(customer.getPhoneNumber());
        dto.setUpdate_status(customer.getUpdateStatus());
        return dto;
    }

    public static Customer mapToNewCustomer(CustomerAddDto dto){
        Customer customer = new Customer();

        customer.setNic(dto.getCustomerId());
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setAddress(dto.getAddress());
        customer.setPhoneNumber(dto.getPhoneNumber());

        return customer;
    }
}


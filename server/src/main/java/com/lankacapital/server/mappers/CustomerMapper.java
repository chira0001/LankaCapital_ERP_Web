package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.CustomerRegisterDto;
import com.lankacapital.server.dtos.CustomerResponseDto;
import com.lankacapital.server.dtos.LoanResponseDto;
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

        return customer;
    }

    public static CustomerResponseDto mapToCustomerResponseDto(Customer customer){

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

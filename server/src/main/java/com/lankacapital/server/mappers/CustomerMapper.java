package com.lankacapital.server.mappers;

import com.lankacapital.server.dtos.CustomerRegisterDto;
import com.lankacapital.server.dtos.CustomerResponseDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.enums.Role;

public class CustomerMapper {
    public static Customer mapToCustomer(CustomerRegisterDto customerRegisterDto){
        return new Customer(
                customerRegisterDto.getNic(),
                customerRegisterDto.getName(),
                customerRegisterDto.getEmail(),
                customerRegisterDto.getAddress(),
                Role.customer,
                customerRegisterDto.getPhoneNumber(),
                "pass@123",
                null
        );
    }

    public static CustomerResponseDto mapToCustomerResponse(Customer customer){
        return new CustomerResponseDto(
                customer.getNic(),
                customer.getName(),
                customer.getEmail(),
                customer.getAddress(),
                customer.getRole().toString(),
                customer.getPhoneNumber(),
                customer.getLoans()
        );
    }
}

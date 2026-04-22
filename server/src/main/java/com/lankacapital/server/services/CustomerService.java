package com.lankacapital.server.services;

import com.lankacapital.server.dtos.CustomerRegisterDto;
import com.lankacapital.server.dtos.CustomerResponseDto;

import java.util.List;

public interface CustomerService {
    CustomerResponseDto registerCustomer(CustomerRegisterDto customerRegisterDto);
    List<CustomerResponseDto> getAllCustomer();
}

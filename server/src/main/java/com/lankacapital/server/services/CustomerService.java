package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;

import java.util.List;

public interface CustomerService {
    CustomerResponseDto registerCustomer(CustomerRegisterDto customerRegisterDto);
    List<CustomerResponseDto> getAllCustomer();
    CustomerResponseDto getCustomerById(Long nic);
    CustomerInfoDto getCustomerInfoById(Long nic);
    CustomerResponseDto updateCustomerById(Long nic, CustomerRegisterDto customerRegisterDto);
    List<CustomerResAsyncDto> findAllCustomerById(CustomerAsyncDto nicList, int page);
    CustomerResDto getCustomerDataById(Long nic);

    List<CustomerResponseDto> getAllActiveCustomers();

    CustomerResponseDto getActiveCustomerById(Long nic);

    void deleteCustomer(Long nic);

    void undoDelete(Long nic);
}
package com.lankacapital.server.services;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Customer;

import java.util.List;

public interface CustomerService {
    CustomerResponseDto registerCustomer(CustomerRegisterDto customerRegisterDto, String username);
    List<CustomerResponseDto> getAllCustomer();
    CustomerResponseDto getCustomerById(String nic);
    CustomerInfoDto getCustomerInfoById(String nic);
    CustomerResponseDto updateCustomerById(String nic, CustomerRegisterDto customerRegisterDto);
    List<CustomerResAsyncDto> findAllCustomerById(CustomerAsyncDto nicList);
    CustomerResDto getCustomerDataById(String nic);

    List<CustomerManageDto> manageCustomers(int page);

    List<CustomerResponseDto> getAllActiveCustomers();

    CustomerResponseDto getActiveCustomerById(String nic);

    void deleteCustomer(String nic);

    void undoDelete(String nic);
    Customer addNewCustomer(CustomerAddSyncDto customerAddSyncDto);
    public List<String> searchCustomersByNic(String nic);
}
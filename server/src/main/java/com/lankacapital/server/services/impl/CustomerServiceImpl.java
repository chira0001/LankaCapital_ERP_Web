package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.CustomerRegisterDto;
import com.lankacapital.server.dtos.CustomerResponseDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.mappers.CustomerMapper;
import com.lankacapital.server.repositories.CustomerRepository;
import com.lankacapital.server.services.CustomerService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private CustomerRepository customerRepository;

    @Transactional
    @Override
    public CustomerResponseDto registerCustomer(CustomerRegisterDto customerRegisterDto) {
        try {
            if(customerRepository.existsById(customerRegisterDto.getNic())){
                throw new ResourceExistException("Customer already registered with id : " + customerRegisterDto.getNic());
            }

            Customer newCustomer = customerRepository.save(CustomerMapper.mapToCustomer(customerRegisterDto));
            return CustomerMapper.mapToCustomerResponse(newCustomer);

        }catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public List<CustomerResponseDto> getAllCustomer() {
        List<Customer> customerList = customerRepository.findAll();
        return customerList.stream()
                .map(CustomerMapper::mapToCustomerResponse)
                .toList();
    }
}

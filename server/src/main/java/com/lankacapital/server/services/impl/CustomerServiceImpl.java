package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.CustomerInfoDto;
import com.lankacapital.server.dtos.CustomerRegisterDto;
import com.lankacapital.server.dtos.CustomerResponseDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.CustomerMapper;
import com.lankacapital.server.mappers.LoanMapper;
import com.lankacapital.server.repositories.CustomerRepository;
import com.lankacapital.server.repositories.LoanRepository;
import com.lankacapital.server.repositories.RoleRepository;
import com.lankacapital.server.services.CustomerService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private CustomerRepository customerRepository;
    private LoanRepository loanRepository;
    private RoleRepository roleRepository;

    @Transactional
    @Override
    public CustomerResponseDto registerCustomer(CustomerRegisterDto dto) {

        if (customerRepository.existsById(dto.getNic())) {
            throw new ResourceExistException(
                    "Customer already registered with id : " + dto.getNic()
            );
        }

        Customer customer = CustomerMapper.mapToCustomer(dto);
        Role role = roleRepository.findByRoleName("Customer");
        customer.setRole(role);
        Customer savedCustomer = customerRepository.save(customer);

        return CustomerMapper.mapToCustomerResponseDto(savedCustomer);
    }

    @Override
    public List<CustomerResponseDto> getAllCustomer() {
        return customerRepository.findAllWithLoans()
                .stream()
                .map(CustomerMapper::mapToCustomerResponseDto)
                .toList();
    }

    @Override
    public CustomerResponseDto getCustomerById(Long nic) {
        Customer customer = customerRepository.findByNic(nic);
        if(customer == null){
            throw new ResourceNotFoundException("Customer not exists with id : " + nic);
        }
        return CustomerMapper.mapToCustomerResponseDto(customer);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    @Override
    public CustomerInfoDto getCustomerInfoById(Long nic) {

        Customer customer = customerRepository.findByNicWithLoans(nic);
        if(customer == null){
            throw new ResourceNotFoundException("Customer not found with id : " + nic);
        }

        CustomerInfoDto dto = new CustomerInfoDto();

        dto.setCustomerNIC(customer.getNic());
        dto.setBusinessName(customer.getName());
        dto.setBusinessAddress(customer.getAddress());
        dto.setBusinessEmail(customer.getEmail());
        dto.setContactNumber(customer.getPhoneNumber());
        dto.setBank(customer.getBank());
        dto.setBankAccount(customer.getBankAccount());

        dto.setLoans(
                customer.getLoans()
                        .stream()
                        .map(LoanMapper::mapToLoanResponseDto)
                        .toList()
        );

        return dto;
    }

    @Transactional
    @Override
    public CustomerResponseDto updateCustomerById(Long nic, CustomerRegisterDto customerRegisterDto) {
        Customer customer = customerRepository.findByNic(nic);
        if(customer == null){
            throw new ResourceNotFoundException("Customer not found with NIC : " + nic);
        }
        customer = CustomerMapper.mapToCustomer(customerRegisterDto);
        return CustomerMapper.mapToCustomerResponseDto(customerRepository.save(customer));
    }
}

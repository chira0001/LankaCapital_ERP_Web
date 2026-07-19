package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.CustomerMapper;
import com.lankacapital.server.mappers.LoanMapper;
import com.lankacapital.server.repositories.CustomerRepository;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.LoanRepository;
import com.lankacapital.server.repositories.RoleRepository;
import com.lankacapital.server.services.CustomerService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private CustomerRepository customerRepository;
    private LoanRepository loanRepository;
    private RoleRepository roleRepository;
    private EmployeeRepository employeeRepository;

    @Transactional
    @Override
    public CustomerResponseDto registerCustomer(CustomerRegisterDto dto, String username) {

        if (customerRepository.existsById(dto.getNic())) {
            throw new ResourceExistException(
                    "Customer already registered with id : " + dto.getNic()
            );
        }

        Customer customer = CustomerMapper.mapToCustomer(dto);

        Role role = roleRepository.findByRoleName("Customer");
        if (role == null) {
            role = new Role();
            role.setRoleName("Customer");
            role = roleRepository.save(role);
        }
        customer.setRole(role);
        customer.setCreatedEmployee(employeeRepository.findByEmail(username));
        return CustomerMapper.mapToCustomerResponseDto(customerRepository.save(customer));
    }

    @Override
    public List<CustomerResponseDto> getAllCustomer() {
        return customerRepository.findAllWithLoans()
                .stream()
                .map(CustomerMapper::mapToCustomerResponseDto)
                .toList();
    }

    @Override
    public CustomerResponseDto getCustomerById(String nic) {
        Customer customer = customerRepository.findByNic(nic);
        if(customer == null){
            throw new ResourceNotFoundException("Customer not exists with id : " + nic);
        }
        return CustomerMapper.mapToCustomerResponseDto(customer);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    @Override
    public CustomerInfoDto getCustomerInfoById(String nic) {

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
    public CustomerResponseDto updateCustomerById(String nic, CustomerRegisterDto dto) {
        Customer customer = customerRepository.findByNic(nic);

        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found with NIC : " + nic);
        }

        Long status = customer.getUpdateStatus();

        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhoneNumber(dto.getPhoneNumber());
        customer.setAddress(dto.getAddress());
        customer.setUpdateStatus((status == null ? 0 : status) + 1);

        return CustomerMapper.mapToCustomerResponseDto(customerRepository.save(customer));
    }

    @Override
    public List<CustomerResAsyncDto> findAllCustomerById(String username, CustomerAsyncDto customerAsyncDto) {
        Employee employee = employeeRepository.findByEmail(username);
        if(employee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }
        List<Customer> customers = customerRepository.findCustomersByNics(customerAsyncDto.getNic());

        return customers.stream()
                .map(CustomerMapper::mapToCustomerAsyncDto)
                .toList();
    }

    @Override
    public CustomerResDto getCustomerDataById(String username, String nic){
        Employee emp = employeeRepository.findByEmail(username);
        if(emp == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }

        Customer customer = customerRepository.findByNicWithLoans(nic);
        if(customer == null){
            throw new ResourceNotFoundException("Customer not found with id : " + nic);
        }
        CustomerResDto dto = new CustomerResDto();
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setPhoneNumber(customer.getPhoneNumber());
        dto.setAddress(customer.getAddress());
        dto.setLoans(customer
                .getLoans()
                .stream().map(LoanMapper::mapToLoanResDto)
                .toList()
        );
        return dto;
    }

    @Override
    public List<CustomerResponseDto> getAllActiveCustomers() {
        return customerRepository.findAll()
                .stream()
                .filter(c -> !c.getDeleted())
                .map(CustomerMapper::mapToCustomerResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDto getActiveCustomerById(String nic) {
        Customer customer = customerRepository.findByNic(nic);
        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found");
        }
        if (Boolean.TRUE.equals(customer.getDeleted())) {
            throw new ResourceNotFoundException("Customer is deleted");
        }
        return CustomerMapper.mapToCustomerResponseDto(customer);
    }

    @Override
    public void deleteCustomer(String nic) {

        Customer customer = customerRepository.findByNic(nic);

        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found");
        }

        customer.setDeleted(true);
        customerRepository.save(customer);
    }

    @Override
    public void undoDelete(String nic) {

        Customer customer = customerRepository.findByNic(nic);

        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found");
        }

        customer.setDeleted(false);
        customerRepository.save(customer);
    }

    public List<CustomerManageDto> manageCustomers(String username, int page) {
        Employee authEmployee = employeeRepository.findByEmail(username);
        if(authEmployee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }
        Pageable pageable = PageRequest.of(page, 50);

        return customerRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(customer -> new CustomerManageDto(
                        customer.getNic(),
                        customer.getUpdateStatus()
                ))
                .toList();
    }

//        return getAllCustomer();

//        return customerRepository.findUpdatedCustomers(pageable)
//                .stream()
//                .map(CustomerMapper::mapToCustomerAsyncDto)
//                .toList();

    @Override
    public Customer addNewCustomer(String username, CustomerAddSyncDto customerAddSyncDto){
        Employee authEmployee = employeeRepository.findByEmail(username);
        if(authEmployee == null){
            throw new ResourceNotFoundException("Employee not found with verification");
        }

        if (customerRepository.existsById(customerAddSyncDto.getNic())) {
            throw new ResourceExistException(
                    "Customer already registered with id : " + customerAddSyncDto.getNic()
            );
        }

        Customer customer = new Customer();

        customer.setNic(customerAddSyncDto.getNic());
        customer.setName(customerAddSyncDto.getName());
        customer.setEmail(customerAddSyncDto.getEmail());
        customer.setPhoneNumber(customerAddSyncDto.getPhoneNumber());
        customer.setAddress( customerAddSyncDto.getAddress() );
        customer.setDeleted(false);

        Role role = roleRepository.findByRoleName("Customer");
        if (role == null) {
            role = new Role();
            role.setRoleName("Customer");
            role = roleRepository.save(role);
        }
        customer.setRole(role);

        Customer savedCustomer = customerRepository.save(customer);
        return savedCustomer;
    }

    @Override
    public List<String> searchCustomersByNic(String nic) {
        if (nic.length() < 3) {
            return Collections.emptyList();
        }
        List<Customer> customerList = customerRepository.findTop10ByNicStartingWith(nic);
        return customerList.stream().map(CustomerMapper::mapToCustomerId).toList();
    }
}

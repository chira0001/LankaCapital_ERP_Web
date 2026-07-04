package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Customer;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
        if (role == null) {
            role = new Role();
            role.setRoleName("Customer");
            role = roleRepository.save(role);
        }
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

//    @Transactional
//    @Override
//    public CustomerResponseDto updateCustomerById(Long nic, CustomerRegisterDto customerRegisterDto) {
//        Customer customer = customerRepository.findByNic(nic);
//        Long status = customer.getUpdateStatus();
//        if(customer == null){
//            throw new ResourceNotFoundException("Customer not found with NIC : " + nic);
//        }
//
//        System.out.println("104 : "+status);
//        customer = CustomerMapper.mapToCustomer(customerRegisterDto);
//        customer.setUpdateStatus(status + 1);
//
//        System.out.println(customer);
//        return CustomerMapper.mapToCustomerResponseDto(customerRepository.save(customer));
//    }

    @Transactional
    @Override
    public CustomerResponseDto updateCustomerById(Long nic, CustomerRegisterDto dto) {
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
    public List<CustomerResAsyncDto> findAllCustomerById(CustomerAsyncDto nicList, int page){
        List<Long> allCustomerIds =  customerRepository.findAllCustomerIds();
        if(allCustomerIds == null){
            throw new ResourceNotFoundException("Server Error: Customer");
        }
        List<Long> notSyncedIds = new ArrayList<>();
        for (Long id : allCustomerIds) {
            if (!nicList.getNic().contains(id)) {
                notSyncedIds.add(id);
            }
        }
        if(notSyncedIds.isEmpty()){
            return List.of();
        }
        Pageable pageable = PageRequest.of(page, 5);
        return customerRepository.findCustomersByIds(notSyncedIds ,pageable)
                .stream()
                .map(CustomerMapper::mapToCustomerAsyncDto)
                .toList();
    }

    public CustomerResDto getCustomerDataById(Long nic){
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

    // ==============================
    // ACTIVE CUSTOMERS
    // ==============================
    @Override
    public List<CustomerResponseDto> getAllActiveCustomers() {
        return customerRepository.findAll()
                .stream()
                .filter(c -> !c.getDeleted())
                .map(CustomerMapper::mapToCustomerResponseDto)
                .collect(Collectors.toList());
    }



    // ==============================
    // GET ACTIVE CUSTOMER BY NIC (STRING)
    // ==============================
    @Override
    public CustomerResponseDto getActiveCustomerById(Long nic) {
        Customer customer = customerRepository.findByNic(nic);
        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found");
        }
        if (Boolean.TRUE.equals(customer.getDeleted())) {
            throw new ResourceNotFoundException("Customer is deleted");
        }
        return CustomerMapper.mapToCustomerResponseDto(customer);
    }

    // ==============================
    // UPDATE CUSTOMER (NIC VERSION)
    // ==============================
//    @Override
//    public CustomerResponseDto updateCustomerById(Long nic, CustomerRegisterDto dto) {
//
//        Customer customer = customerRepository.findByNic(nic);
//
//        if (customer == null) {
//            throw new ResourceNotFoundException("Customer not found");
//        }
//
//        customer.setName(dto.getName());
//        customer.setAddress(dto.getAddress());
//        customer.setPhoneNumber(dto.getPhoneNumber());
//
//        return mapToDto(customerRepository.save(customer));
//    }

    // ==============================
    // SOFT DELETE
    // ==============================
    @Override
    public void deleteCustomer(Long nic) {

        Customer customer = customerRepository.findByNic(nic);

        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found");
        }

        customer.setDeleted(true);
        customerRepository.save(customer);
    }

    // ==============================
    // UNDO DELETE
    // ==============================
    @Override
    public void undoDelete(Long nic) {

        Customer customer = customerRepository.findByNic(nic);

        if (customer == null) {
            throw new ResourceNotFoundException("Customer not found");
        }

        customer.setDeleted(false);
        customerRepository.save(customer);
    }

    // ==============================
    // MAPPER
    // ==============================
//

}
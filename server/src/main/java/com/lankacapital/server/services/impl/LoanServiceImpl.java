package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.*;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.LoanMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.LoanService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class LoanServiceImpl implements LoanService {
    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final InstallmentRepository installmentRepository;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;

    @Transactional
    @Override
    public Loan addLoan(LoanCreateDto loanCreateDto) {
        Loan loan = LoanMapper.mapToLoan(loanCreateDto);
        Customer customer;
        //customer not exists => create new customer
        if (!customerRepository.existsById(loanCreateDto.getCustomerId())){
            Customer newCustomer = LoanMapper.mapToCustomer(loanCreateDto);
            Role role = roleRepository.findByRoleName("Customer");
            newCustomer.setRole(role);
            customerRepository.save(newCustomer);
        }

        if(loanRepository.existsByFileNumber(loan.getFileNumber())){
            throw new ResourceExistException("Loan exists with file number : " + loan.getFileNumber());
        }

        customer = customerRepository.findById(loanCreateDto.getCustomerId())
                .orElseThrow(()->new ResourceNotFoundException("Customer not found " + loanCreateDto.getCustomerId()));

        loan.setCustomer(customer);

        Installment installment = installmentRepository.findById(loanCreateDto.getNumberOfInstallments())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid installment value"));
        loan.setNumberOfInstallments(installment);

        Employee employee = employeeRepository.findById(loanCreateDto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id : " + loanCreateDto.getEmployeeId()));
        loan.setEmployeeId(employee);

        return loanRepository.save(loan);
    }

    @Override
    public List<LoanResponseDto> getLoansByCustomerId(String id) {
        try {
            Customer customer = customerRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
            List<Loan> loanList = loanRepository.findAllByCustomer(customer);
            return loanList.stream().map(LoanMapper::mapToLoanResponseDto).toList();
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid Customer Id " + id);
        }

    }
}

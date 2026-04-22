package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.Customer;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Installment;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.LoanMapper;
import com.lankacapital.server.repositories.CustomerRepository;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.InstallmentRepository;
import com.lankacapital.server.repositories.LoanRepository;
import com.lankacapital.server.services.LoanService;
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

    @Override
    public Loan addLoan(LoanCreateDto loanCreateDto) {

        Loan loan = LoanMapper.mapToLoan(loanCreateDto);

        Customer customer = customerRepository.findById(loanCreateDto.getCustomerId())
                .orElseThrow(()->new ResourceNotFoundException("Customer not found " + loanCreateDto.getCustomerId()));

        loan.setCustomerId(customer);

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
            List<Loan> loanList = loanRepository.findAllByCustomerId(customer);
            return loanList.stream().map(LoanMapper::mapToLoanResponseDto).toList();
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid Customer Id " + id);
        }

    }
}

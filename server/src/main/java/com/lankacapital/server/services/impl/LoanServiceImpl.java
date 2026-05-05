package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.LoanActionDto;
import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.*;
import com.lankacapital.server.enums.LoanStatus;
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


    @Override
    public List<LoanResponseDto>getAllLoans(){
        return loanRepository.findAll()
                .stream()
                .map(LoanMapper::mapToLoanResponseDto)
                .toList();
    }


    @Override
    public LoanResponseDto getLoan(String fileNumber) {

        Loan loan = loanRepository.findById(fileNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found: " + fileNumber));

        return LoanMapper.mapToLoanResponseDto(loan);
    }

    @Transactional
    @Override
    public Loan approveLoan(LoanActionDto dto) {
        //find loan from DB
        Loan loan =loanRepository.findById(dto.getFileNumber())
                .orElseThrow(()->new ResourceNotFoundException("Loan not found: "+ dto.getFileNumber()));

        //update status
        loan.setStatus(LoanStatus.APPROVED);

        //clear rejection note
        loan.setRejectionNote(null);
        //save and return
        return loanRepository.save(loan);
    }

    @Transactional
    @Override
    public Loan rejectLoan(LoanActionDto dto) {
        Loan loan =loanRepository.findById(dto.getFileNumber())
                .orElseThrow(()->new ResourceNotFoundException("Loan not found:"+dto.getFileNumber()));
    loan.setStatus(LoanStatus.REJECTED);
    loan.setRejectionNote(dto.getRejectionNote());
    return loanRepository.save(loan);
    }
}

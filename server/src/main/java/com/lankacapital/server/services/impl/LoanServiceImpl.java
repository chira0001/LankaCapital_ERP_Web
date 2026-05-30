package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.*;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.CustomerMapper;
import com.lankacapital.server.mappers.LoanMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.LoanService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import  java.util.Optional;
@Slf4j
@Service
@AllArgsConstructor
public class LoanServiceImpl implements LoanService {
    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final InstallmentRepository installmentRepository;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final InterestRateRepository interestRateRepository;

    @Transactional
    @Override
    public Loan addLoan(LoanCreateDto loanCreateDto) {
        Loan loan = LoanMapper.mapToLoan(loanCreateDto);
        Customer customer;
        //customer not exists => create new customer
        if (!customerRepository.existsById(loanCreateDto.getCustomerId())) {
            Customer newCustomer = LoanMapper.mapToCustomer(loanCreateDto);
            Role role = roleRepository.findByRoleName("Customer");
            newCustomer.setRole(role);
            customerRepository.save(newCustomer);
        }

        if (loanRepository.existsByFileNumber(loan.getFileNumber())) {
            throw new ResourceExistException("Loan exists with file number : " + loan.getFileNumber());
        }

        customer = customerRepository.findByNic(loanCreateDto.getCustomerId());
        loan.setCustomer(customer);

        Installment installment = installmentRepository.findById(loanCreateDto.getNumberOfInstallments())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid installment value"));
        loan.setInstallment(installment);

        Employee employee = employeeRepository.findById(loanCreateDto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id : " + loanCreateDto.getEmployeeId()));
        loan.setEmployee(employee);

        InterestRate rate = interestRateRepository.findById(loanCreateDto.getInterestRate())
                .orElseThrow(() -> new ResourceNotFoundException("Interest rate not found with id : " + loanCreateDto.getInterestRate()));
        loan.setInterestRate(rate);

        //Add Loan Status as pending
        loan.setStatus(LoanStatus.PENDING);
        //System.out.println("62 : " + loan);
        loan.setFileNumber(loanCreateDto.getFileNumber());
        return loanRepository.save(loan);
    }

    @Override
    public CustomerResponseDto getLoansByCustomerId(String id) {
    //public List<LoanResponseDto> getLoansByCustomerId(String id) {

        try {
            Customer customer = customerRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));

            CustomerResponseDto dto = CustomerMapper.mapToCustomerResponseDto(customer);

            List<Loan> loanList = loanRepository.findAllByCustomer(customer);
            List<LoanResponseDto> loanResponseDtos = loanList.stream().map(LoanMapper::mapToLoanResponseDto).toList();
            dto.setLoans(loanResponseDtos);
            return dto;
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid Customer Id " + id);
        }
    }

    @Override
    public Loan addLoanToExistingCustomer(FieldOfficerLoanCreateDto loanCreateDto) {
//        Long nic;
//        try{
//            nic = Long.parseLong(loanCreateDto.getCustomerNic());
//        } catch (NumberFormatException e) {
//            throw new NumberFormatException("Enter valid NIC Number : " + loanCreateDto.getCustomerNic());
//        }
        Customer customer = customerRepository.findByNic(loanCreateDto.getCustomerNic());
        if(customer == null){
            throw new ResourceNotFoundException("Customer not found " + loanCreateDto.getCustomerNic());
        }
        Employee employee = employeeRepository
                .findById(loanCreateDto.getEmployeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found")
                );
        Installment installment = installmentRepository
                .findById(loanCreateDto.getInstallmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Installment not found"
                        )
                );

        Loan loan = new Loan();
        loan.setCustomer(customer);
        loan.setAmount(loanCreateDto.getAmount());
        loan.setEmployee(employee);
        loan.setInstallment(installment);

        return loanRepository.save(loan);
    }

    @Override
    public List<LoanResponseDto> getAllLoans() {
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
        Loan loan = loanRepository.findById(dto.getFileNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + dto.getFileNumber()));

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not founded" + dto.getEmployeeId()));

        loan.setEmployee(employee);
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
        Loan loan = loanRepository.findById(dto.getFileNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found:" + dto.getFileNumber()));
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not founded" + dto.getEmployeeId()));
        loan.setEmployee(employee);
        loan.setStatus(LoanStatus.REJECTED);
        loan.setRejectionNote(dto.getRejectionNote());
        return loanRepository.save(loan);
    }

    @Override
    public Loan resetLoan(LoanActionDto dto) {
        Loan loan = loanRepository.findByFileNumber(dto.getFileNumber())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found: " + dto.getFileNumber()));

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found: " + dto.getEmployeeId()));

        loan.setEmployee(employee);

        // RESET BACK TO PENDING
        loan.setStatus(LoanStatus.PENDING);

        // clear rejection note
        loan.setRejectionNote(null);

        return loanRepository.save(loan);
    }


    @Override
    public LoanResponseDto updateInterest(InterestUpdateDTO dto) {
        Loan loan=loanRepository.findById(dto.getFileNumber())
                .orElseThrow(()->new ResourceNotFoundException("Loan not Found"+dto.getFileNumber()));

        InterestRate rate = interestRateRepository.findById(dto.getInterestRate())
                        .orElseThrow(()->new ResourceNotFoundException("Interest Rate not Found"+dto.getInterestRate()));

        loan.setInterestRate(rate);
        return LoanMapper.mapToLoanResponseDto(loanRepository.save(loan));
    }

    @Override
    public LoanResponseDto getInterest(String fileNumber) {
        Loan loan=loanRepository.findById(fileNumber)
                .orElseThrow(()->new ResourceNotFoundException("Loan not founded:"+fileNumber));
        return LoanMapper.mapToLoanResponseDto(loan);
    }

    @Override
    public LoanResponseDto resetInterest(String fileNumber) {
        Loan loan = loanRepository.findById(fileNumber)
                .orElseThrow(()->new ResourceNotFoundException("Loan not founded:"+fileNumber));
//        loan.setInterestRate(0.0);
        return LoanMapper.mapToLoanResponseDto(loanRepository.save(loan));
    }

    public List<LoanResAsyncDto> findAllLoansById(LoanAsyncDto fileNoLis, int page){
        List<String> allLoanIds = loanRepository.findAllLoanIds();
        if(allLoanIds == null){
            throw new ResourceNotFoundException("Server Error: Loan");
        }
        List<String> notSyncedIds = new ArrayList<>();
        for (String id : allLoanIds) {
            if (!fileNoLis.getFile_number().contains(id)) {
                notSyncedIds.add(id);
            }
        }
        Pageable pageable = PageRequest.of(page, 3);
        return loanRepository.findLoansByIds(notSyncedIds, pageable)
                .stream()
                .map(LoanMapper::mapToCustomerAsyncDto)
                .toList();
    }
}

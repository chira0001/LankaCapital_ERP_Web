package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.dtos.ReceptionistDto.RecepLoanUpdateDto;
import com.lankacapital.server.entities.*;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.LoanType;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.CustomerMapper;
import com.lankacapital.server.mappers.LoanMapper;
import com.lankacapital.server.repositories.*;
import com.lankacapital.server.services.LoanService;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.utils.UtilityFunctions;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

import static com.lankacapital.server.utils.UtilityFunctions.isValidUUID;

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
    public Loan addLoan(LoanCreateDto dto, String username) {
        Customer customer;

        if (!customerRepository.existsById(dto.getCustomerId())) {

            Customer newCustomer = new Customer();

            newCustomer.setNic(dto.getCustomerId());
            newCustomer.setName(dto.getName());
            newCustomer.setEmail(dto.getEmail());
            newCustomer.setAddress(dto.getAddress());
            newCustomer.setPhoneNumber(dto.getPhoneNumber());
            newCustomer.setBank(dto.getBank());
            newCustomer.setBankAccount(dto.getBankAccount());
            newCustomer.setCreatedEmployee(employeeRepository.findByEmail(username));

            Role role = roleRepository.findByRoleName("Customer");
            newCustomer.setRole(role);

            customer = customerRepository.save(newCustomer);

        } else {
            customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Customer not found"));
        }
        Loan loan = LoanMapper.mapToLoan(dto);
        if (loanRepository.existsByFileNumber(dto.getFileNumber())) {
            throw new ResourceExistException(
                    "Loan exists with file number: " + dto.getFileNumber()
            );
        }

        loan.setCustomer(customer);
        loan.setInstallment(dto.getNumberOfInstallments());
        loan.setCreatedEmployee(employeeRepository.findByEmail(username));
        loan.setInterestRate(dto.getInterestRate());
        loan.setStatus(LoanStatus.PENDING);

        loan.setFileNumber(UUID.randomUUID().toString());
        return loanRepository.save(loan);
    }

    @Override
    public String fetchLastFileNumber(String loanType) {

        LoanType type = LoanType.valueOf(loanType.toUpperCase());

        return loanRepository.findByLoanTypeOrderByIdDesc(type)
                .stream()
                .filter(loan -> !isValidUUID(loan.getFileNumber()))
                .map(Loan::getFileNumber)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("File number unable to fetch")); // or return "0" or throw exception
    }

    @Override
    public CustomerResponseDto getLoansByCustomerId(String id) {

        try {
            Customer customer = customerRepository.findById(id)
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
        Customer customer = customerRepository.findByNic(loanCreateDto.getCustomerNic());
        if(customer == null){
            throw new ResourceNotFoundException("Customer not found " + loanCreateDto.getCustomerNic());
        }
        long loanCount = loanRepository.countActiveLoans(customer.getNic(), LoanStatus.REJECTED);
        if (loanCount >= 2) {
            throw new ResourceExistException("Customer already has 2 loans.");
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
        loan.setCreatedEmployee(employee);
        loan.setInstallment(loanCreateDto.getInstallmentId());
        loan.setCreatedAt(loanCreateDto.getCreatedAt());

        return loanRepository.save(loan);
    }

    @Override
    public List<LoanResponseDto> getAllLoans(String username) {

        Employee employee = employeeRepository.findByEmail(username);
        String role = employee.getRole().getRoleName();

        return loanRepository.findAll()
                .stream()
                .filter(loan -> {
                    if ("ADMIN".equals(role)) {
                        return !isValidUUID(loan.getFileNumber());
                    }
                    if ("RECEPTIONIST".equals(role)) {
                        return isValidUUID(loan.getFileNumber());
                    }
                    return false; // other roles see nothing
                })
                .map(LoanMapper::mapToLoanResponseDto)
                .toList();
    }

    @Override
    public LoanResponseDto getLoan(String fileNumber) {

        Loan loan = loanRepository.findByFileNumber(fileNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found: " + fileNumber));

        return LoanMapper.mapToLoanResponseDto(loan);
    }

    @Transactional
    @Override
    public Loan approveLoan(LoanActionDto dto) {
        //find loan from DB
        Loan loan = loanRepository.findByFileNumber(dto.getFileNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + dto.getFileNumber()));

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not founded" + dto.getEmployeeId()));

//        loan.setEmployee(employee);
        //update status
        loan.setStatus(LoanStatus.APPROVED);

        //clear rejection note
//        loan.setRejectionNote(null);
        loan.setUpdateStatus(loan.getUpdateStatus() + 1);
        loan.setDecisionNote(dto.getDecisionNote());
        //save and return
        return loanRepository.save(loan);
    }

    @Transactional
    @Override
    public Loan rejectLoan(LoanActionDto dto) {
        Loan loan = loanRepository.findByFileNumber(dto.getFileNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found:" + dto.getFileNumber()));
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not founded" + dto.getEmployeeId()));
        loan.setUpdatedEmployee(employee);
        loan.setStatus(LoanStatus.REJECTED);
//        loan.setRejectionNote(dto.getRejectionNote());
        loan.setUpdateStatus(loan.getUpdateStatus() + 1);
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

        loan.setUpdatedEmployee(employee);

        // RESET BACK TO PENDING
        loan.setStatus(LoanStatus.PENDING);

        // clear rejection note
//        loan.setRejectionNote(null);
        loan.setUpdateStatus(loan.getUpdateStatus() + 1);
        loan.setDecisionNote(null);

        return loanRepository.save(loan);
    }

    @Override
    public LoanResponseDto updateLoan(String username,
                                      LoanUpdateDto loanUpdateDto,
                                      String fileNumber) {

        Loan loan = loanRepository.findByFileNumber(fileNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not Found " + fileNumber));

        Employee employee = employeeRepository.findByEmail(username);

        loan.setAmount(loanUpdateDto.getAmount());
        loan.setDecisionNote(loanUpdateDto.getDecisionNote());
        loan.setDocumentCharge(loanUpdateDto.getDocumentCharge());
        loan.setInterestRate(loanUpdateDto.getInterestRate());
        loan.setInstallment(loanUpdateDto.getInstallment());
        loan.setStatus(LoanStatus.valueOf(loanUpdateDto.getStatus()));

        if (LoanStatus.APPROVED.name().equals(loanUpdateDto.getStatus())) {
            loan.setApprovedEmployee(employee);
        } else if (LoanStatus.PENDING.name().equals(loanUpdateDto.getStatus())) {
            loan.setApprovedEmployee(null);
            loan.setUpdatedEmployee(employee);
        } else {
            loan.setUpdatedEmployee(employee);
        }

        loan.setUpdateStatus(loan.getUpdateStatus() + 1);

        return LoanMapper.mapToLoanResponseDto(loanRepository.save(loan));
    }

    @Override
    public LoanResponseDto recepUpdateLoan(String username,
                                           RecepLoanUpdateDto dto,
                                           String fileNumber) {

        Loan loan = loanRepository.findByFileNumber(fileNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not Found " + fileNumber)
                );

        if(isValidUUID(dto.getFileNumber())){
            throw new ResourceExistException("Please assign a file number");
        }

        if(loanRepository.existsByFileNumber(dto.getFileNumber())){
            throw new ResourceExistException("Loan number already exists. Increment by one");
        }
        
        Employee employee = employeeRepository.findByEmail(username);

        loan.setFileNumber(dto.getFileNumber());

        loan.setDocumentCharge(dto.getDocumentCharge());
        loan.setInterestRate(dto.getInterestRate());
        loan.setUpdatedEmployee(employee);
        loan.setUpdateStatus(
                loan.getUpdateStatus() == null ? 1 : loan.getUpdateStatus() + 1
        );

        Loan savedLoan = loanRepository.save(loan);

        return LoanMapper.mapToLoanResponseDto(savedLoan);
    }

//    Lookup at this ---------------------------------------------------------------------------

    @Override
    public LoanResponseDto updateInterest(InterestUpdateDTO dto, String username) {
        Loan loan=loanRepository.findByFileNumber(dto.getFileNumber())
                .orElseThrow(()->new ResourceNotFoundException("Loan not Found"+dto.getFileNumber()));

//        InterestRate rate = interestRateRepository.findById(dto.getInterestRate())
//                        .orElseThrow(()->new ResourceNotFoundException("Interest Rate not Found"+dto.getInterestRate()));

        loan.setInterestRate(dto.getInterestRate());
        loan.setUpdateStatus(loan.getUpdateStatus() + 1);
        loan.setUpdatedEmployee(employeeRepository.findByEmail(username));
        return LoanMapper.mapToLoanResponseDto(loanRepository.save(loan));
    }

    @Override
    public LoanResponseDto getInterest(String fileNumber) {
        Loan loan=loanRepository.findByFileNumber(fileNumber)
                .orElseThrow(()->new ResourceNotFoundException("Loan not founded:"+fileNumber));
        return LoanMapper.mapToLoanResponseDto(loan);
    }

    @Override
    public LoanResponseDto resetInterest(String fileNumber) {
        Loan loan = loanRepository.findByFileNumber(fileNumber)
                .orElseThrow(()->new ResourceNotFoundException("Loan not founded:"+fileNumber));
//        loan.setInterestRate(0.0);
        loan.setUpdateStatus(loan.getUpdateStatus() + 1);
        return LoanMapper.mapToLoanResponseDto(loanRepository.save(loan));
    }

    @Override
    public List<LoanResAsyncDto> findAllLoansById(LoanAsyncDto fileNoLis){
        List<Loan> loans = loanRepository.findLoansByIds(fileNoLis.getId());

        return loans.stream()
                .map(LoanMapper::mapToCustomerAsyncDto)
                .toList();
    }

    @Override
    public Loan addLoanByFieldOfficer(LoanRequestDto loanRequestDto){
        Loan loan = new Loan();
        loan.setAmount(loanRequestDto.getLoanAmount());
        if (!customerRepository.existsById(loanRequestDto.getCustomerId())) {
            Customer newCustomer = LoanMapper.mapToNewCustomer(loanRequestDto);
            Role role = roleRepository.findByRoleName("Customer");
            newCustomer.setRole(role);
            customerRepository.save(newCustomer);
        }
        Customer customer;
        customer = customerRepository.findByNic(loanRequestDto.getCustomerId());
        loan.setCustomer(customer);

//        Installment installment = installmentRepository.findById(loanRequestDto.getInstallments())
//                .orElseThrow(() -> new ResourceNotFoundException("Invalid installment value"));
        loan.setInstallment(loanRequestDto.getInstallments());

        Employee employee = employeeRepository.findById(loanRequestDto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id : " + loanRequestDto.getEmployeeId()));
        loan.setCreatedEmployee(employee);
        loan.setStatus(LoanStatus.PENDING);
        return loanRepository.save(loan);
    }

    @Override
    public String addNewLoanByOfficer(CustomerAddDto customerAddDto){
        if (customerRepository.existsById(customerAddDto.getCustomerId())) {
            throw new ResourceExistException("Customer exists with NIC : " + customerAddDto.getCustomerId());
        }
        Loan loan = new Loan();

//        Installment installment = installmentRepository.findById(customerAddDto.getInstallmentId())
//                .orElseThrow(() -> new ResourceNotFoundException("Invalid installment value"));
        loan.setInstallment(customerAddDto.getInstallmentId());

        Employee employee = employeeRepository.findById(customerAddDto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id : " + customerAddDto.getEmployeeId()));
        loan.setCreatedEmployee(employee);

        loan.setAmount(customerAddDto.getLoanAmount());
        Customer newCustomer = CustomerMapper.mapToNewCustomer(customerAddDto);
        Role role = roleRepository.findByRoleName("Customer");
        newCustomer.setRole(role);
        customerRepository.save(newCustomer);

        Customer customer = customerRepository.findByNic(customerAddDto.getCustomerId());
        loan.setCustomer(customer);

        loan.setStatus(LoanStatus.PENDING);
        loanRepository.save(loan);

        return "Loan created successfully.";
    }

    @Override
    public List<LoanReportRow> getMonthlyLoanReport(YearMonth month) {
        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.plusMonths(1).atDay(1).atStartOfDay();

        return loanRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(this::toReportRow)
                .collect(Collectors.toList());
    }

    private LoanReportRow toReportRow(Loan loan) {
        Customer customer = loan.getCustomer();
        Employee employee = loan.getCreatedEmployee();
//        Installment installment = loan.getInstallment();
//        InterestRate interestRate = loan.getInterestRate();

        return new LoanReportRow(
                loan.getFileNumber(),
                customer != null ? customer.getNic() : null,
                customer != null ? customer.getName() : null,
                loan.getAmount(),
                loan.getInterestRate(),
                loan.getInstallment(),
//                interestRate != null ? interestRate.getRate() : null,
//                noOfInstallments != null ? noOfInstallments.getValue() : null,
                loan.getStatus(),
                employee != null ? employee.getId() : null,
                employee != null ? employee.getFirstName() + " " + employee.getLastName() : null,
                loan.getDocumentCharge(),
                loan.getCreatedAt(),
                loan.getDecisionNote()
        );
    }

    @Override
    public BigDecimal getApprovedLoanTotal() {

        return loanRepository.findByStatus(LoanStatus.APPROVED)
                .stream()
                .map(Loan::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public CustomerResponseDto getCustomerWithLoans(String id) {

//        Long customerId = Long.parseLong(id);

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found with id " + id));

        return CustomerMapper.mapToCustomerResponseDto(customer);
    }

    public List<LoanManageDto> manageLoans(int page){
        Pageable pageable = PageRequest.of(page, 50);

        return loanRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(loan -> new LoanManageDto(
                        loan.getFileNumber(),
                        loan.getUpdateStatus()
                ))
                .toList();
    }

//    @Transactional
//    @Override
//    public Loan completeLoan(LoanActionDto dto) {
//
//        Loan loan = loanRepository.findById(dto.getFileNumber())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Loan not found : " + dto.getFileNumber()));
//
//        Employee employee = employeeRepository.findById(dto.getEmployeeId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Employee not found : " + dto.getEmployeeId()));
//
//        loan.setEmployee(employee);
//
//        loan.setStatus(LoanStatus.COMPLETED);
//
//        loan.setUpdateStatus(loan.getUpdateStatus() + 1);
//
//        return loanRepository.save(loan);
//    }
}



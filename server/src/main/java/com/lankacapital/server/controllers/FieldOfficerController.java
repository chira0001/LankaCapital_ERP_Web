package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.entities.Installment;
import com.lankacapital.server.entities.InterestRate;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.services.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/field")
@AllArgsConstructor
public class FieldOfficerController {
    private final LoanService loanService;
    private final CustomerService customerService;
    private final InstallmentService installmentService;
    private final EmployeeService employeeService;
    private final InterestRateService interestRateService;
    private final DailyCollectionService dailyCollectionService;

    @PostMapping(path = "/customers/loans")
    public ResponseEntity<?> addLoanToExistingCustomer(@RequestBody FieldOfficerLoanCreateDto dto) {
        try {
            Loan loan = loanService.addLoanToExistingCustomer(dto);
            if (loan == null) {
                return new ResponseEntity<>("Loan not created", HttpStatus.NOT_IMPLEMENTED);
            }
            return new ResponseEntity<>("Loan submitted successfully", HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_IMPLEMENTED);
        } catch (ResourceExistException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(path = "/async/customers")
    public ResponseEntity<?> asyncToCustomers(@RequestBody CustomerAsyncDto dto, @RequestParam(defaultValue = "0") int page){
        if(dto.getNic() == null){
            return new ResponseEntity<>("Nic cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<CustomerResAsyncDto> customerList = customerService.findAllCustomerById(dto, page);
        if(customerList == null){
            return new ResponseEntity<>("No customers found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(customerList, HttpStatus.OK);
    }

    @PostMapping(path = "/async/installments")
    public ResponseEntity<?> asyncToInstallments(@RequestBody InstallmentsAsyncDto dto, @RequestParam(defaultValue = "0") int page){
        if(dto.getId() == null){
            return new ResponseEntity<>("Id cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<Installment> installmentList = installmentService.findAllInstallmentsById(dto, page);
        if(installmentList == null){
            return new ResponseEntity<>("No Installments found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(installmentList, HttpStatus.OK);
    }

    @PostMapping(path = "/async/interests")
    public ResponseEntity<?> asyncToInstallments(@RequestBody InterestRateAsyncDto dto, @RequestParam(defaultValue = "0") int page){
        if(dto.getId() == null){
            return new ResponseEntity<>("Id cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<InterestRate> interestRateList = interestRateService.findAllinterestRatesById(dto, page);
        if(interestRateList == null){
            return new ResponseEntity<>("No Installments found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(interestRateList, HttpStatus.OK);
    }


    @PostMapping(path = "/async/fieldOfficers")
    public ResponseEntity<?> asyncToFieldOfficers(@RequestBody FieldOfficerAsyncDto dto, @RequestParam(defaultValue = "0") int page){
        if(dto.getId() == null){
            return new ResponseEntity<>("Id cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<FieldOfficerResAsyncDto> employeeList = employeeService.findAllFieldOfficersById(dto, page);
        if(employeeList == null){
            return new ResponseEntity<>("No Field Officer found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(employeeList, HttpStatus.OK);
    }

    @PostMapping(path = "/async/loans")
    public ResponseEntity<?> asyncToFieldOfficers(@RequestBody LoanAsyncDto dto, @RequestParam(defaultValue = "0") int page){
        if(dto.getFile_number() == null){
            return new ResponseEntity<>("File Number cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<LoanResAsyncDto> loanList = loanService.findAllLoansById(dto, page);
        if(loanList == null){
            return new ResponseEntity<>("No Loans found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanList, HttpStatus.OK);
    }

    @GetMapping(path = "/customers/loans/{id}")
    public ResponseEntity<?> getLoanDetailsByCustomerId(@PathVariable String id){
        if(id == null){
            return new ResponseEntity<>("Customer Id is not defined", HttpStatus.BAD_REQUEST);
        }
        long nic;
        try {
            nic = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Enter valid nic");
        }
        return new ResponseEntity<>(customerService.getCustomerDataById(nic), HttpStatus.OK);
    }

    @PostMapping(path = "/customer/loan")
    public ResponseEntity<?> addLoanByFieldOfficer(@RequestBody LoanRequestDto dto) {
        if (dto.getEmployeeId() == null) {
            return new ResponseEntity<>("Employee Id is not defined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanService.addLoanByFieldOfficer(dto), HttpStatus.OK);
    }

    @GetMapping(path = "/installments")
    public ResponseEntity<?> getInstallments(){
        return new ResponseEntity<>(installmentService.getAllInstallments(), HttpStatus.OK);
    }

    @GetMapping("/interestRates")
    public ResponseEntity<?> getInterestRates(){
        return new ResponseEntity<>(interestRateService.getAllInterestRates(),HttpStatus.OK);
    }

    @PostMapping("/sync/customer")
    public ResponseEntity<?> syncToFieldOfficers(@RequestBody List<CustomerRegisterDto> customerList) {
        List<Long> successIds = new ArrayList<>();
        for (CustomerRegisterDto customerDto : customerList) {
            try {
                CustomerResponseDto customer = customerService.registerCustomer(customerDto);
                successIds.add(customer.getNic());
            } catch (ResourceExistException e) {
                successIds.add(customerDto.getNic());
            }catch (Exception e) {
                return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return ResponseEntity.ok(successIds);
    }

    @PostMapping("/sync/loan")
    public ResponseEntity<?> syncToLoan(@RequestBody List<FieldOfficerLoanCreateDto> loanList) {
        List<LoanResSyncDto> response = new ArrayList<>();
        for (FieldOfficerLoanCreateDto loanDto : loanList) {
            try {
                Loan loan = loanService.addLoanToExistingCustomer(loanDto);
                if (loan != null) {
                    response.add(
                            new LoanResSyncDto(
                                    loanDto.getId(),
                                    loan.getFileNumber(),
                                    "success"
                            )
                    );
                }
            } catch (ResourceExistException | ResourceNotFoundException e) {
                response.add(
                        new LoanResSyncDto(
                                loanDto.getId(),
                                "",
                                "failure"
                        )
                );
            } catch (Exception e) {
                return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/sync/collection")
    public ResponseEntity<?> syncToDailyCollections(@RequestBody List<CollectionSyncDto> collectionList) {
        List<String> successIds = new ArrayList<>();
        for (CollectionSyncDto collectionDto : collectionList) {
            try {
                successIds.add(dailyCollectionService.syncDailyCollection(collectionDto));
            }catch (Exception e) {
                return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return ResponseEntity.ok(successIds);
    }

    @PostMapping("add/customer")
    public ResponseEntity<?> addLoanToNewCustomer(@RequestBody CustomerAddDto customerAddDto) {
        if(customerAddDto.getEmployeeId() == null || customerAddDto.getCustomerId() == null){
            return new ResponseEntity<>("Employee Id is not defined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanService.addNewLoanByOfficer(customerAddDto), HttpStatus.CREATED);
    }

    @GetMapping("/update/customer")
    public ResponseEntity<?> updateCustomers(@RequestParam(defaultValue = "0") int page) {
        try {
            return ResponseEntity.ok(customerService.updateCustomers(page));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/update/employee")
    public ResponseEntity<?> updateEmployees(@RequestParam(defaultValue = "0") int page) {
        try {
            return ResponseEntity.ok(employeeService.updateEmployees(page));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/update/loan")
    public ResponseEntity<?> updateLoans(@RequestParam(defaultValue = "0") int page) {
        try {
            return ResponseEntity.ok(customerService.updateCustomers(page));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/add/collection")
    public ResponseEntity<?> addDailyCollection(@RequestBody CollectionRequestDto collectionDto){
        try {
            DailyCollection collection = dailyCollectionService.addDailyCollection(collectionDto);
            if (collection == null) {
                return new ResponseEntity<>("Failed to submit the daily collection", HttpStatus.NOT_IMPLEMENTED);
            }
            return new ResponseEntity<>("Daily Collection submitted successfully", HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_IMPLEMENTED);
        } catch (Exception e) {
            return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping(path = "/employees/profile")
    public ResponseEntity<?> updateProfileInfo(Authentication authentication, @RequestBody EmployeeResponseDto dto){
        return new ResponseEntity<>(employeeService.updateEmployeeInfo(authentication.getName(),dto), HttpStatus.OK);

    }

    @GetMapping(path = "/employees/profile")
    public ResponseEntity<?> getProfileDetails(Authentication authentication){
        System.out.printf("----Username----- : " + authentication.getName());

        return new ResponseEntity<>(employeeService.getEmployeeDetailByUsername(authentication.getName()), HttpStatus.OK);
    }



}

package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Installment;
import com.lankacapital.server.entities.InterestRate;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.services.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping(path = "/customers/loans")
    public ResponseEntity<?> addLoanToExistingCustomer(@RequestBody FieldOfficerLoanCreateDto dto){
        Loan loan = loanService.addLoanToExistingCustomer(dto);
        if(loan == null){
            return new ResponseEntity<>("Loan not created", HttpStatus.NOT_IMPLEMENTED);
        }
        return new ResponseEntity<>("Loan submitted successfully", HttpStatus.CREATED);
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
}

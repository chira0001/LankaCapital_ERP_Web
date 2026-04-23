package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.services.CustomerService;
import com.lankacapital.server.services.EmployeeMetaDataService;
import com.lankacapital.server.services.LoanService;
import com.lankacapital.server.services.SalaryService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/recep")
@AllArgsConstructor
public class ReceptionistController {

    private final EmployeeMetaDataService employeeMetaDataService;
    private final CustomerService customerService;
    private final LoanService loanService;
    private final SalaryService salaryService;

    @PostMapping(path = "/customer/register")
    public ResponseEntity<?> registerCustomer(@RequestBody CustomerRegisterDto customerRegisterDto){

        CustomerResponseDto registeredCustomer = customerService.registerCustomer(customerRegisterDto);
        if (registeredCustomer == null){
            return new ResponseEntity<>("User not registered", HttpStatus.EXPECTATION_FAILED);
        }
         return new ResponseEntity<>(registeredCustomer, HttpStatus.CREATED);
    }

    @GetMapping(path = "/customer")
    public ResponseEntity<?> getAllCustomer(){
        List<CustomerResponseDto> responseDtoList = customerService.getAllCustomer();
        if (responseDtoList.isEmpty()){
            return new ResponseEntity<>("Nothing to display", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(responseDtoList, HttpStatus.OK);
    }

    @PostMapping(path = "/loan/create")
    public ResponseEntity<?> addLoan(@RequestBody LoanCreateDto loanCreateDto){
        return new ResponseEntity<>(loanService.addLoan(loanCreateDto), HttpStatus.CREATED);
    }

    @GetMapping(path = "/loan/customer/{id}")
    public ResponseEntity<?> getLoansByCustomerId(@PathVariable String id){
        List<LoanResponseDto> responseDtoList = loanService.getLoansByCustomerId(id);
        if (responseDtoList.isEmpty()){
            return new ResponseEntity<>("Nothing to display", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(responseDtoList, HttpStatus.OK);
    }

    @PostMapping(path = "/employee/salary")
    public ResponseEntity<?> addSalary(@RequestBody EmployeeSalaryAddDto salaryAddDto){
        salaryService.addSalaryToEmployee(salaryAddDto);
        return new ResponseEntity<>("Salary added successfully", HttpStatus.CREATED);
    }
}

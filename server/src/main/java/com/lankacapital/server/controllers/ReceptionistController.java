package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.services.*;
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
    private final EmployeeService employeeService;
    private final InstallmentService installmentService;

    @GetMapping(path = "/installments")
    public ResponseEntity<?> getAllInstallments(){
        return new ResponseEntity<>(installmentService.getAllInstallments(), HttpStatus.OK);
    }

    @PostMapping(path = "/customers")
    public ResponseEntity<?> registerCustomer(@RequestBody CustomerRegisterDto customerRegisterDto){
        CustomerResponseDto registeredCustomer = customerService.registerCustomer(customerRegisterDto);
        if (registeredCustomer == null){
            return new ResponseEntity<>("Customer not registered", HttpStatus.EXPECTATION_FAILED);
        }
         return new ResponseEntity<>(registeredCustomer, HttpStatus.CREATED);
    }

    @GetMapping(path = "/customers/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable String id){
        try {
            CustomerResponseDto existCustomer = customerService.getCustomerById(Long.parseLong(id));
            return new ResponseEntity<>(existCustomer, HttpStatus.OK);
        }catch (NumberFormatException e){
            return new ResponseEntity<>("Enter valid NIC", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping(path = "/customers")
    public ResponseEntity<?> getAllCustomer(){
        List<CustomerResponseDto> responseDtoList = customerService.getAllCustomer();
        if (responseDtoList.isEmpty()){
            return new ResponseEntity<>("Nothing to display", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(responseDtoList, HttpStatus.OK);
    }

    @PostMapping(path = "/loans")
    public ResponseEntity<?> addLoan(@RequestBody LoanCreateDto loanCreateDto){
        if(loanCreateDto.getEmployeeId() == null){
            return new ResponseEntity<>("Employee Id is not defined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanService.addLoan(loanCreateDto), HttpStatus.CREATED);
    }

    @GetMapping(path = "/loan/customers/{id}")
    public ResponseEntity<?> getLoansByCustomerId(@PathVariable String id){
        List<LoanResponseDto> responseDtoList = loanService.getLoansByCustomerId(id);
        if (responseDtoList.isEmpty()){
            return new ResponseEntity<>("Nothing to display", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(responseDtoList, HttpStatus.OK);
    }

    @GetMapping(path = "/employees")
    public ResponseEntity<?> getAllEmployees(){
        return new ResponseEntity<>(employeeService.getAllEmployees(), HttpStatus.OK);
    }

    @PostMapping(path = "/employees/salary")
    public ResponseEntity<?> addSalary(@RequestBody List<EmployeeSalaryAddDto> salaryAddDtoList){
        System.out.println("Here 1");
        salaryService.addSalaryToEmployee(salaryAddDtoList);
        return new ResponseEntity<>("Salaries added successfully", HttpStatus.CREATED);
    }
}

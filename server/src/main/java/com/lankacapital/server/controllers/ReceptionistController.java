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
    private final MonthlyExpenseService monthlyExpenseService;

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

    @PutMapping(path = "/customers")
    public ResponseEntity<?> updateCustomer(
            @RequestParam String customerId,
            @RequestBody CustomerRegisterDto customerRegisterDto
    ){
        if(customerId == null){
            return new ResponseEntity<>("Employee Id is not defined", HttpStatus.BAD_REQUEST);
        }
        long nic;
        try {
            nic = Long.parseLong(customerId);
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Enter valid id");
        }
        return new ResponseEntity<>(customerService.updateCustomerById(nic,customerRegisterDto), HttpStatus.OK);
    }

    @GetMapping(path = "/customers/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable String id){
        System.out.println(id);
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

    @GetMapping(path = "/customers/loans/{id}")
    public ResponseEntity<?> getLoanDetailsByCustomerId(@PathVariable String id){
        if(id == null){
            return new ResponseEntity<>("Employee Id is not defined", HttpStatus.BAD_REQUEST);
        }
        long nic;
        try {
            nic = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Enter valid id");
        }
        return new ResponseEntity<>(customerService.getCustomerInfoById(nic), HttpStatus.OK);
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
        salaryService.addSalaryToEmployee(salaryAddDtoList);
        return new ResponseEntity<>("Salaries added successfully", HttpStatus.CREATED);
    }

    @GetMapping(path = "/employees/{id}")
    public ResponseEntity<?> getProfileDetails(@PathVariable String id){
        long empId;
        try{
            empId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid employee Id");
        }
        return new ResponseEntity<>(employeeService.getEmployeeDetailById(empId), HttpStatus.OK);
    }

    @PutMapping(path = "/employees/password/{id}")
    public ResponseEntity<?> changePrfilePassword(@PathVariable String id, @RequestBody PasswordRequestDto passwordRequestDto){
        long empId;
        try{
            empId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid employee Id");
        }
        return new ResponseEntity<>(employeeService.updatePasswordById(empId, passwordRequestDto), HttpStatus.OK);
    }

    @PutMapping(path = "/employees/{id}")
    public ResponseEntity<?> updateProfileInfo(@PathVariable String id, @RequestBody EmployeeResponseDto dto){
        long empId;
        try{
            empId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new NumberFormatException("Invalid employee Id");
        }
        return new ResponseEntity<>(employeeService.updateEmployeeInfo(empId,dto), HttpStatus.OK);
    }

    @PostMapping(path = "/monthlyExpenses")
    public ResponseEntity<?> addMonthlyExpenses(@RequestBody MonthlyExpenseRequestDto monthlyExpenseRequestDto){
        return new ResponseEntity<>(monthlyExpenseService.addMonthlyExpenses(monthlyExpenseRequestDto), HttpStatus.CREATED);
    }
}

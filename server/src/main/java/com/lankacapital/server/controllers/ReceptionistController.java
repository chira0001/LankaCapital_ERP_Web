package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.services.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final DailyCollectionService dailyCollectionService;
    private final InterestRateService interestRateService;
    private final PettyCashService pettyCashService;

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
    public ResponseEntity<?> addLoan(@RequestBody LoanCreateDto loanCreateDto, Authentication authentication){
        if(authentication.getName() == null){
            return new ResponseEntity<>("Employee cannot be determined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanService.addLoan(loanCreateDto, authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping(path = "/loan/customers/{id}")
    public ResponseEntity<?> getLoansByCustomerId(@PathVariable String id){
        CustomerResponseDto dto = loanService.getLoansByCustomerId(id);
        //List<LoanResponseDto> responseDtoList = loanService.getLoansByCustomerId(id);

        if (dto == null){
            return new ResponseEntity<>("Nothing to display", HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @GetMapping(path = "/employees")
    public ResponseEntity<?> getAllEmployees(){
        return new ResponseEntity<>(employeeService.getAllEmployeesWithRole(), HttpStatus.OK);
    }

    @PostMapping(path = "/employees/salary")
    public ResponseEntity<?> addSalary(@RequestBody List<EmployeeSalaryAddDto> salaryAddDtoList){
        salaryService.addSalaryToEmployee(salaryAddDtoList);
        return new ResponseEntity<>("Salaries added successfully", HttpStatus.CREATED);
    }

    @GetMapping(path = "/employees/profile")
    public ResponseEntity<?> getProfileDetails(Authentication authentication){
        return new ResponseEntity<>(employeeService.getEmployeeDetailByUsername(authentication.getName()), HttpStatus.OK);
    }

    @PutMapping(path = "/employees/profile/password")
    public ResponseEntity<?> changeProfilePassword(Authentication authentication, @RequestBody PasswordRequestDto passwordRequestDto){
        return new ResponseEntity<>(employeeService.updatePasswordByUsername(authentication.getName(), passwordRequestDto), HttpStatus.OK);
    }

    @PutMapping(path = "/employees/profile")
    public ResponseEntity<?> updateProfileInfo(Authentication authentication, @RequestBody EmployeeResponseDto dto){
        return new ResponseEntity<>(employeeService.updateEmployeeInfo(authentication.getName(),dto), HttpStatus.OK);
    }

    @PostMapping(path = "/monthlyExpenses")
    public ResponseEntity<?> addMonthlyExpenses(
            @RequestBody MonthlyExpenseRequestDto monthlyExpenseRequestDto,
            Authentication authentication
    ){
        return new ResponseEntity<>(monthlyExpenseService.addMonthlyExpenses(monthlyExpenseRequestDto, authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/loan/collection/{fileNumber}")
    public ResponseEntity<List<DailyCollectionResponseDto>> getCollectionForLoan(
            @PathVariable @NotBlank(message = "File number is required") String fileNumber) {

        List<DailyCollectionResponseDto> collections =
                dailyCollectionService.getLoanCollectionDetailsByFileNumber(fileNumber);

        return ResponseEntity.ok(collections);
    }

    @GetMapping("/interestRates")
    public ResponseEntity<?> getAllInterestRates(){
        return new ResponseEntity<>(interestRateService.getAllInterestRates(),HttpStatus.OK);
    }

    @PostMapping("/pettyCash")
    public ResponseEntity<?> addPettyCashRequest(@RequestBody PettyCashDto pettyCashDto, Authentication authentication){
        return new ResponseEntity<>(pettyCashService.addPettyCash(pettyCashDto, authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/pettyCash")
    public ResponseEntity<?> getEmployeeAddedPettyCash(Authentication authentication){
        return new ResponseEntity<>(pettyCashService.getPettyCashForEmployee(authentication.getName()), HttpStatus.OK);
    }
}

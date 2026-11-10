package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.dtos.ReceptionistDto.RecepLoanUpdateDto;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.LoanMapper;
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
//    private final InstallmentService installmentService;
    private final DailyCollectionService dailyCollectionService;
    private final AdministrativeExpenseCategoryService administrativeExpenseCategoryService;
    private final AdministrativeExpenseService administrativeExpenseService;
    private final FinancialStatementService financialStatementService;
    private final ReceptionistDashboardService receptionistDashboardService;

    @PutMapping(path = "/customers")
    public ResponseEntity<?> updateCustomer(
            @RequestParam String customerId,
            @RequestBody CustomerRegisterDto customerRegisterDto
    ){
        if(customerId == null){
            return new ResponseEntity<>("Employee Id is not defined", HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(customerService.updateCustomerById(customerId,customerRegisterDto), HttpStatus.OK);
    }

    @GetMapping(path = "/customers/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable String id){
        try {
            CustomerResponseDto existCustomer = customerService.getCustomerById(id);
            return new ResponseEntity<>(existCustomer, HttpStatus.OK);
        }catch (NumberFormatException e){
            return new ResponseEntity<>("Enter valid NIC", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping(path = "/customers/loans/{id}")
    public ResponseEntity<?> getLoanDetailsByCustomerId(@PathVariable String id){
        if(id == null){
            return new ResponseEntity<>("Customer Id is not defined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(customerService.getCustomerInfoById(id), HttpStatus.OK);
    }

    @GetMapping("/loans")
    public ResponseEntity<?> getAllLoans(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                loanService.getAllLoans(authentication.getName(), page, size, search)
        );
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<?> getDashboardSummary() {
        return ResponseEntity.ok(receptionistDashboardService.getDashboardStats());
    }

    @GetMapping("/loans/lastFileNumber/{loanType}")
    public ResponseEntity<?> fetchLastFileNumber(Authentication authentication, @PathVariable String loanType){
        if(authentication.getName() == null){
            return new ResponseEntity<>("Employee cannot be determined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanService.fetchLastFileNumber(loanType), HttpStatus.OK);
    }

    @PostMapping(path = "/loans")
    public ResponseEntity<?> addLoan(@RequestBody LoanCreateDto loanCreateDto, Authentication authentication){
        if(authentication.getName() == null){
            return new ResponseEntity<>("Employee cannot be determined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(
                LoanMapper.mapToLoanResponseDto(loanService.addLoan(loanCreateDto, authentication.getName())),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/loans")
    public ResponseEntity<?> updateLoan(
            @RequestParam String fileNumber,
            @RequestBody RecepLoanUpdateDto recepLoanUpdateDto,
            Authentication authentication)
    {
        return new ResponseEntity<>(loanService.recepUpdateLoan(authentication.getName(),recepLoanUpdateDto,fileNumber), HttpStatus.OK);
    }

    @GetMapping(path = "/employees")
    public ResponseEntity<?> getAllEmployees(){
        return new ResponseEntity<>(employeeService.getAllEmployeesWithRole(), HttpStatus.OK);
    }

    @PostMapping(path = "/employees/salary")
    public ResponseEntity<?> addSalary(
            @RequestBody List<EmployeeSalaryAddDto> salaryAddDtoList,
            Authentication authentication
    ){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }

        salaryService.addSalaryToEmployee(salaryAddDtoList, authentication.getName());
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

    @GetMapping("/loan/collection/{fileNumber}")
    public ResponseEntity<List<DailyCollectionResponseDto>> getCollectionForLoan(
            @PathVariable @NotBlank(message = "File number is required") String fileNumber) {

        List<DailyCollectionResponseDto> collections =
                dailyCollectionService.getLoanCollectionDetailsByFileNumber(fileNumber);

        return ResponseEntity.ok(collections);
    }

    @PostMapping("/administrative-expenses")
    public ResponseEntity<?> addAdministrativeExpenseRequest(@RequestBody AdministrativeExpenseDto administrativeExpenseDto, Authentication authentication){
        return new ResponseEntity<>(administrativeExpenseService.addAdministrativeExpense(administrativeExpenseDto, authentication.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/administrative-expenses")
    public ResponseEntity<?> getEmployeeAddedAdministrativeExpense(Authentication authentication){
        return new ResponseEntity<>(administrativeExpenseService.getAdministrativeExpenseForEmployee(authentication.getName()), HttpStatus.OK);
    }

    @PutMapping(path = "/administrative-expenses/{id}")
    public ResponseEntity<?> updateAdministrativeExpense(
            Authentication authentication,
            @RequestBody AdministrativeExpenseDto administrativeExpenseDto,
            @PathVariable Long id
    ){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(administrativeExpenseService.updateAdministrativeExpense(authentication.getName(),id,administrativeExpenseDto), HttpStatus.OK);
    }

    @GetMapping(path = "/administrative-expense-categories")
    public ResponseEntity<?> getAllAdministrativeExpenseCategories(Authentication authentication){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(administrativeExpenseCategoryService.getAllCategories(), HttpStatus.OK);
    }

//    @PostMapping("/financials")
//    public ResponseEntity<?> addBusinessFinancials(
//            Authentication authentication,
//            @RequestBody FinancialRequestDto financialRequestDto
//    ){
//        return new ResponseEntity<>(financialStatementService.addFinancials(authentication.getName(),financialRequestDto), HttpStatus.CREATED);
//    }

    @GetMapping("/customers/search")
    public ResponseEntity<List<?>> searchCustomers(
            @RequestParam String nic) {

        return ResponseEntity.ok(customerService.searchCustomersByNic(nic));
    }

    @GetMapping(path = "/loan-summary")
    public ResponseEntity<?> fetchLoanSummary(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName().isEmpty()) {
            throw new ResourceNotFoundException("Token is invalid");
        }

        return new ResponseEntity<>(loanService.fetchLoanSummary(page, size, search), HttpStatus.OK);
    }

    @GetMapping(path = "/loan-summary/{loanId}/payments")
    public ResponseEntity<?> fetchLoanPayments(
            @PathVariable Long loanId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName().isEmpty()) {
            throw new ResourceNotFoundException("Token is invalid");
        }

        return new ResponseEntity<>(loanService.fetchLoanPayments(loanId, page, size), HttpStatus.OK);
    }
}

package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.*;
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
    private final EmployeeService employeeService;
    private final DailyCollectionService dailyCollectionService;

    @GetMapping("/ping")
    public ResponseEntity<?> ping(Authentication authentication) {
        if(authentication.getName() == null){
            throw new ResourceNotFoundException("Authentication name is null");
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping(path = "/customers/loans")
    public ResponseEntity<?> addLoanToExistingCustomer(Authentication authentication, @RequestBody FieldOfficerLoanCreateDto dto) {
        try {
            Loan loan = loanService.addLoanToExistingCustomer(authentication.getName(), dto);
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
    public ResponseEntity<?> asyncToCustomers(Authentication authentication, @RequestBody CustomerAsyncDto dto){
        if(dto.getNic() == null){
            return new ResponseEntity<>("Nic cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<CustomerResAsyncDto> customerList = customerService.findAllCustomerById(authentication.getName(), dto);
        if(customerList == null){
            return new ResponseEntity<>("No customers found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(customerList, HttpStatus.OK);
    }

    @PostMapping(path = "/async/fieldOfficers")
    public ResponseEntity<?> asyncToFieldOfficers(Authentication authentication, @RequestBody FieldOfficerAsyncDto dto){
        if(dto.getId() == null){
            return new ResponseEntity<>("Id cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<FieldOfficerResAsyncDto> employeeList = employeeService.findAllFieldOfficersById(authentication.getName(), dto);
        if(employeeList == null){
            return new ResponseEntity<>("No Field Officer found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(employeeList, HttpStatus.OK);
    }

    @PostMapping(path = "/async/loans")
    public ResponseEntity<?> asyncToFieldOfficers(Authentication authentication, @RequestBody LoanAsyncDto dto){
        if(dto.getId() == null){
            return new ResponseEntity<>("File Number cannot be empty", HttpStatus.BAD_REQUEST);
        }
        List<LoanResAsyncDto> loanList = loanService.findAllLoansById(authentication.getName(), dto);
        if(loanList == null){
            return new ResponseEntity<>("No Loans found", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanList, HttpStatus.OK);
    }

    @GetMapping(path = "/customers/loans/{id}")
    public ResponseEntity<?> getLoanDetailsByCustomerId(Authentication authentication, @PathVariable String id){
        if(id == null){
            return new ResponseEntity<>("Customer Id is not defined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(customerService.getCustomerDataById(authentication.getName(), id), HttpStatus.OK);
    }

    @PostMapping(path = "/customer/loan")
    public ResponseEntity<?> addLoanByFieldOfficer(Authentication authentication, @RequestBody LoanRequestDto dto) {
        if (dto.getCustomerId() == null) {
            return new ResponseEntity<>("Customer Id is not defined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanService.addLoanByFieldOfficer(authentication.getName(), dto), HttpStatus.OK);
    }

    @PostMapping("/sync/customer")
    public ResponseEntity<?> syncToFieldOfficers(Authentication authentication, @RequestBody List<CustomerAddSyncDto> customerList) {
        List<String> successIds = new ArrayList<>();
        for (CustomerAddSyncDto customerDto : customerList) {
            try {
                Customer customer = customerService.addNewCustomer(authentication.getName(), customerDto);
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
    public ResponseEntity<?> syncToLoan(Authentication authentication, @RequestBody List<FieldOfficerLoanCreateDto> loanList) {
        List<LoanResSyncDto> response = new ArrayList<>();
        for (FieldOfficerLoanCreateDto loanDto : loanList) {
            try {
                Loan loan = loanService.addLoanToExistingCustomer(authentication.getName(), loanDto);
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
    public ResponseEntity<?> syncToDailyCollections(Authentication authentication, @RequestBody List<CollectionSyncDto> collectionList) {
        List<String> successIds = new ArrayList<>();
        for (CollectionSyncDto collectionDto : collectionList) {
            try {
                String value = dailyCollectionService.syncDailyCollection(authentication.getName(), collectionDto);
                if(value != null){
                    successIds.add(collectionDto.getId());
                }
            } catch (ResourceNotFoundException e) {
                return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_IMPLEMENTED);
            }catch (Exception e) {
                return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return ResponseEntity.ok(successIds);
    }

    @PostMapping("add/customer")
    public ResponseEntity<?> addLoanToNewCustomer(Authentication authentication, @RequestBody CustomerAddDto customerAddDto) {
        if(customerAddDto.getEmployeeId() == null || customerAddDto.getCustomerId() == null){
            return new ResponseEntity<>("Employee Id is not defined", HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(loanService.addNewLoanByOfficer(authentication.getName(), customerAddDto), HttpStatus.CREATED);
    }

    @GetMapping("/manage/customer")
    public ResponseEntity<?> updateCustomers(Authentication authentication, @RequestParam(defaultValue = "0") int page) {
        try {
            return ResponseEntity.ok(customerService.manageCustomers(authentication.getName(), page));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/manage/employee")
    public ResponseEntity<?> updateEmployees(Authentication authentication, @RequestParam(defaultValue = "0") int page) {
        try {
            return ResponseEntity.ok(employeeService.manageEmployees(authentication.getName(), page));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/manage/loan")
    public ResponseEntity<?> updateLoans(Authentication authentication, @RequestParam(defaultValue = "0") int page) {
        try {
            return ResponseEntity.ok(loanService.manageLoans(authentication.getName(), page));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/manage/collection")
    public ResponseEntity<?> updateCollection(Authentication authentication, @RequestBody List<CollectionReqDto> dto) {
        try {
            return ResponseEntity.ok(dailyCollectionService.manageCollections(authentication.getName(), dto));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/add/collection")
    public ResponseEntity<?> addDailyCollection(Authentication authentication, @RequestBody CollectionRequestDto collectionDto){
        try {
            DailyCollection collection = dailyCollectionService.addDailyCollection(authentication.getName(), collectionDto);
            if (collection == null) {
                return new ResponseEntity<>("Failed to submit the daily collection", HttpStatus.NOT_IMPLEMENTED);
            }
            return new ResponseEntity<>("Daily Collection submitted successfully", HttpStatus.CREATED);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_IMPLEMENTED);
        } catch (ResourceExistException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
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

    @GetMapping(path = "/collection/loan")
    public ResponseEntity<?> getLoanByFileNumber(Authentication authentication, @RequestParam("fileNumber") String fileNumber){
        try {
            return ResponseEntity.ok(loanService.getLoanInfoByFileNumber(authentication.getName(), fileNumber));
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_IMPLEMENTED);
        }catch (Exception e){
            return new ResponseEntity<>("An unexpected error occurred.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

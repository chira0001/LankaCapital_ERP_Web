package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.CustomerRegisterDto;
import com.lankacapital.server.dtos.CustomerResponseDto;
import com.lankacapital.server.dtos.LoanCreateDto;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.entities.EmployeeMetaData;
import com.lankacapital.server.services.CustomerService;
import com.lankacapital.server.services.EmployeeMetaDataService;
import com.lankacapital.server.services.LoanService;
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

    @GetMapping("/empmetadata")
    public ResponseEntity<?> getAllData() {
        List<EmployeeMetaData> metaDataList = employeeMetaDataService.getAllData();
        if (metaDataList.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(metaDataList);
    }

    @GetMapping("/empmetadata/category/{id}")
    public ResponseEntity<?> getDataByCategory(@PathVariable String id) {
        EmployeeMetaData data = employeeMetaDataService.getDataById(id);
        if (data == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Not found item with id " + id);
        }
        return ResponseEntity.ok(data);
    }

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
}

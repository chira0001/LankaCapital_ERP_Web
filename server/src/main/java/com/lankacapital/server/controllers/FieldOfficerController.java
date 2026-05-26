package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.FieldOfficerLoanCreateDto;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.services.LoanService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/v1/field")
@AllArgsConstructor
public class FieldOfficerController {
    private LoanService loanService;

    @PostMapping(path = "/customers/loans")
    public ResponseEntity<?> addLoanToExistingCustomer(@RequestBody FieldOfficerLoanCreateDto dto){
        Loan loan = loanService.addLoanToExistingCustomer(dto);
        if(loan == null){
            return new ResponseEntity<>("Loan not created", HttpStatus.NOT_IMPLEMENTED);
        }
        return new ResponseEntity<>("Loan submitted successfully", HttpStatus.CREATED);
    }
}

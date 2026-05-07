package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.FieldOfficerLoanCreateDto;
import com.lankacapital.server.services.LoanService;
import lombok.AllArgsConstructor;
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
        loanService.addLoanToExistingCustomer(dto);

    }

}

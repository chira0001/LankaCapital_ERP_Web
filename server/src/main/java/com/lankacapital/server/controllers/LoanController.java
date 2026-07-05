package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.InterestUpdateDTO;
import com.lankacapital.server.dtos.LoanResponseDto;
import com.lankacapital.server.services.LoanService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/loans")
@AllArgsConstructor
public class LoanController {

    private final LoanService service;

    // GET ALL LOANS
    @GetMapping
    public List<LoanResponseDto> getAll() {
        return service.getAllLoans();
    }

    // GET SINGLE LOAN
    @GetMapping("/{fileNumber}")
    public LoanResponseDto getLoan(@PathVariable String fileNumber) {
        return service.getLoan(fileNumber);
    }

    // UPDATE INTEREST RATE
    @PutMapping("/interest")
    public LoanResponseDto updateInterest(@RequestBody InterestUpdateDTO dto) {
        return service.updateInterest(dto);
    }

    // RESET INTEREST RATE
    @PutMapping("/interest/reset/{fileNumber}")
    public LoanResponseDto resetInterest(@PathVariable String fileNumber) {
        return service.resetInterest(fileNumber);
    }
}
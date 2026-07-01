package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.services.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/api/v1/admin")
@AllArgsConstructor

public class AdminController {

    private final RoleService roleService;
    private final SalaryConditionService salaryConditionService;
    private final EmployeeService employeeService;
    private final LoanService loanService;
    private final PettyCashService pettyCashService;

    @PostMapping(path = "/role")
    public ResponseEntity<?> addNewRole(@RequestBody RoleRegisterDto dto){
        return new ResponseEntity<>(roleService.addNewRole(dto), HttpStatus.CREATED);
    }

    @GetMapping(path = "/role/{roleName}")
    public ResponseEntity<?> getRoleByRoleName(@PathVariable RoleRegisterDto dto){
        return new ResponseEntity<>(roleService.getRoleByRoleName(dto), HttpStatus.OK);
    }

    @GetMapping(path = "/role")
    public ResponseEntity<?> getAllRoles(){
        return new ResponseEntity<>(roleService.getAllRoles(), HttpStatus.OK);
    }


    @PostMapping(path = "/salary-condition")
    public ResponseEntity<?> addNewSalaryCondition(@RequestBody ConditionRegisterDto dto){
        return new ResponseEntity<>(salaryConditionService.addNewSalaryCondition(dto), HttpStatus.CREATED);
    }

    @GetMapping(path = "/salary-condition/{conditionName}")
    public ResponseEntity<?> getSalaryConditionBySalaryCondition(@PathVariable ConditionRegisterDto dto){
        return new ResponseEntity<>(salaryConditionService.getSalaryConditionByConditionName(dto), HttpStatus.OK);
    }

    @GetMapping(path = "/salary-condition")
    public ResponseEntity<?> getAllSalaryConditions(){
        return new ResponseEntity<>(salaryConditionService.getAllSalaryConditions(), HttpStatus.OK);
    }

    @PostMapping(path = "/employee")
    public ResponseEntity<?> addNewEmployee(@RequestBody EmployeeAddDto dto){
        Employee newEmployee = employeeService.addNewEmployee(dto);
        return new ResponseEntity<>(newEmployee, HttpStatus.CREATED);
    }

    //admin loan view
    //@GetMapping("/loans")
    //public ResponseEntity<?> getAllLoans(){
     //   return ResponseEntity.ok(loanService.getAllLoans());
    //}

    ///  /////////new
    @GetMapping("/loans")
    public ResponseEntity<?> getAllLoans() {

        try {
            return ResponseEntity.ok(loanService.getAllLoans());
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/loans/customer/{id}")
    public ResponseEntity<?> getLoansByCustomerId(@PathVariable String id){
        return ResponseEntity.ok(loanService.getLoansByCustomerId(id));
    }

    @GetMapping("/loans/{fileNumber}")
    public ResponseEntity<?> getLoanById(@PathVariable String fileNumber) {
        return ResponseEntity.ok(loanService.getLoan(fileNumber));
    }

    //loan actions
    @PutMapping("/approve")
    public ResponseEntity<?> approve(@RequestBody LoanActionDto dto){
        return  ResponseEntity.ok(loanService.approveLoan(dto));
    }

    @PutMapping("/reject")
    public ResponseEntity<?> reject(@RequestBody LoanActionDto dto){
        return ResponseEntity.ok(loanService.rejectLoan(dto));
    }

    @PutMapping("/reset")
    public ResponseEntity<Loan> resetLoan(@RequestBody LoanActionDto dto) {
        return ResponseEntity.ok(loanService.resetLoan(dto));
    }

    //admin interest management
    @PutMapping("/loans/interest")
    public ResponseEntity<?> updateInterest(@RequestBody InterestUpdateDTO dto){
        return ResponseEntity.ok(loanService.updateInterest(dto));
    }

    @GetMapping("/loans/interest/{fileNumber}")
    public ResponseEntity<?> getInterest(@PathVariable String fileNumber){
        return ResponseEntity.ok(loanService.getInterest(fileNumber));
    }

    @DeleteMapping("/loans/interest/{fileNumber}")
    public ResponseEntity<?> resetInterest(@PathVariable String fileNumber){
        return ResponseEntity.ok(loanService.resetInterest(fileNumber));
    }

    //petty cash
    @GetMapping("/pettyCash")
    public ResponseEntity<?>getAllPettyCash(){
        return ResponseEntity.ok(pettyCashService.getAllPettyCash());
    }

    @PutMapping("/pettyCash/approve/{id}")
    public ResponseEntity<?>approvePettyCash(
            @PathVariable Long id,
            Authentication authentication
    ){
        return ResponseEntity.ok(
                pettyCashService.approvePettyCash(id,authentication.getName())
        );

    }

    @PutMapping("/pettyCash/reject/{id}")
    public ResponseEntity<?>rejectPettyCash(
            @PathVariable Long id,
            Authentication authentication
            ){
        return ResponseEntity.ok(
                pettyCashService.rejectPettyCash(id,authentication.getName())
        );
    }

    @GetMapping("/pettyCash/pending")
    public ResponseEntity<?>getPendingPettyCash(){
        return ResponseEntity.ok(pettyCashService.getPendingRequests());
    }
}


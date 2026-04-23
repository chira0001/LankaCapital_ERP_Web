package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.ConditionRegisterDto;
import com.lankacapital.server.dtos.EmployeeAddDto;
import com.lankacapital.server.dtos.RoleRegisterDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.services.EmployeeService;
import com.lankacapital.server.services.RoleService;
import com.lankacapital.server.services.SalaryConditionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/v1/admin")
@AllArgsConstructor
public class AdminController {

    private final RoleService roleService;
    private final SalaryConditionService salaryConditionService;
    private final EmployeeService employeeService;

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


}

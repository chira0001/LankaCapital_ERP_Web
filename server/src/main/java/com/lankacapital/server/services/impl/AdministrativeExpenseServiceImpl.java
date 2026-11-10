package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.AdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdministrativeExpenseResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.AdministrativeExpense;
import com.lankacapital.server.entities.AdministrativeExpenseCategory;
import com.lankacapital.server.enums.Request;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.AdministrativeExpenseMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.AdministrativeExpenseCategoryRepository;
import com.lankacapital.server.repositories.AdministrativeExpenseRepository;
import com.lankacapital.server.services.AdministrativeExpenseService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@AllArgsConstructor
public class AdministrativeExpenseServiceImpl implements AdministrativeExpenseService {
    private AdministrativeExpenseRepository administrativeExpenseRepository;
    private EmployeeRepository employeeRepository;
    private AdministrativeExpenseCategoryRepository administrativeExpenseCategoryRepository;

    @Override
    public AdministrativeExpenseResponseDto addAdministrativeExpense(AdministrativeExpenseDto administrativeExpenseDto, String username) {
        try {
            AdministrativeExpense administrativeExpense = AdministrativeExpenseMapper.mapToAdministrativeExpense(administrativeExpenseDto);

            Employee requestEmployee = employeeRepository.findByEmail(username);
            if(requestEmployee == null){
                throw new ResourceNotFoundException("Employee verification not found");
            }
            administrativeExpense.setRequestEmployee(requestEmployee);
            administrativeExpense.setRequest(Request.PENDING);
            AdministrativeExpenseCategory administrativeExpenseCategory = administrativeExpenseCategoryRepository.findById(administrativeExpenseDto.getCategory())
                    .orElseThrow(()-> new ResourceNotFoundException("No category found"));
            administrativeExpense.setAdministrativeExpenseCategory(administrativeExpenseCategory);

            administrativeExpenseRepository.save(administrativeExpense);

            return AdministrativeExpenseMapper.mapToAdministrativeExpenseResponseDto(administrativeExpense);

        } catch (RuntimeException e) {
            throw new RuntimeException("Administrative expense submission failed");
        }
    }

    @Override
    public List<AdministrativeExpenseResponseDto> getAdministrativeExpenseForEmployee(String username) {

        Employee requestEmployee = employeeRepository.findByEmail(username);
        if(requestEmployee == null){
            throw new ResourceNotFoundException("Employee verification not found");
        }
        List<AdministrativeExpense> administrativeExpenseList = administrativeExpenseRepository.findByRequestEmployee(requestEmployee);
        return administrativeExpenseList.stream().map(AdministrativeExpenseMapper::mapToAdministrativeExpenseResponseDto).toList();
    }


    //get pending
    @Override
    public List<AdministrativeExpenseResponseDto> getPendingRequests() {
        return administrativeExpenseRepository.findByRequest(Request.PENDING)
                .stream()
                .map(AdministrativeExpenseMapper::mapToAdministrativeExpenseResponseDto)
                .toList();
    }

    //approve
    @Override
    public AdministrativeExpenseResponseDto approveAdministrativeExpense(Long id, String adminUsername) {

        AdministrativeExpense administrativeExpense = administrativeExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrative expense not found"));

        Employee admin = employeeRepository.findByEmail(adminUsername);

        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found");
        }

        administrativeExpense.setRequest(Request.APPROVED);
        administrativeExpense.setApprovedEmployee(admin);

        administrativeExpenseRepository.save(administrativeExpense);

        return AdministrativeExpenseMapper.mapToAdministrativeExpenseResponseDto(administrativeExpense);
    }

    //reject
    @Override
    public AdministrativeExpenseResponseDto rejectAdministrativeExpense(Long id, String adminUsername) {

        AdministrativeExpense administrativeExpense = administrativeExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrative expense not found"));

        Employee admin = employeeRepository.findByEmail(adminUsername);

        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found");
        }

        administrativeExpense.setRequest(Request.REJECTED);
        administrativeExpense.setApprovedEmployee(admin);

        administrativeExpenseRepository.save(administrativeExpense);

        return AdministrativeExpenseMapper.mapToAdministrativeExpenseResponseDto(administrativeExpense);
    }

    //reset
    @Override
    public AdministrativeExpenseResponseDto undoStatus(Long id, String adminUsername) {

        AdministrativeExpense administrativeExpense = administrativeExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrative expense not found"));

        Employee admin = employeeRepository.findByEmail(adminUsername);

        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found");
        }

        // prevent undo if already pending
        if (administrativeExpense.getRequest() == Request.PENDING) {
            throw new RuntimeException("Nothing to undo");
        }

        // reset status
        administrativeExpense.setRequest(Request.PENDING);

        // clear previous approver/rejector
        administrativeExpense.setApprovedEmployee(null);

        administrativeExpenseRepository.save(administrativeExpense);

        return AdministrativeExpenseMapper.mapToAdministrativeExpenseResponseDto(administrativeExpense);
    }

    @Override
    public List<AdministrativeExpenseResponseDto> getAllAdministrativeExpense() {

        return administrativeExpenseRepository.findAll()
                .stream()
                .map(AdministrativeExpenseMapper::mapToAdministrativeExpenseResponseDto)
                .toList();
    }

    @Override
    public AdministrativeExpenseResponseDto updateAdministrativeExpense(String username, Long id, AdministrativeExpenseDto administrativeExpenseDto) {

        AdministrativeExpense administrativeExpense = administrativeExpenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrative Expense Not Found"));

        AdministrativeExpenseCategory administrativeExpenseCategory = administrativeExpenseCategoryRepository.findById(administrativeExpenseDto.getCategory())
                .orElseThrow(() -> new ResourceNotFoundException("Administrative Expense Category Not Found"));

        administrativeExpense.setAmount(administrativeExpenseDto.getAmount());
        administrativeExpense.setNarration(administrativeExpenseDto.getNarration());
        administrativeExpense.setAdministrativeExpenseCategory(administrativeExpenseCategory);
        administrativeExpense.setUpdatedEmployee(employeeRepository.findByEmail(username));

        return AdministrativeExpenseMapper.mapToAdministrativeExpenseResponseDto(administrativeExpenseRepository.save(administrativeExpense));
    }


    @Override
    public BigDecimal getApprovedAdministrativeExpenseTotal() {

        return administrativeExpenseRepository.findAll()
                .stream()
                .filter(pc -> pc.getRequest() == Request.APPROVED)
                .map(AdministrativeExpense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

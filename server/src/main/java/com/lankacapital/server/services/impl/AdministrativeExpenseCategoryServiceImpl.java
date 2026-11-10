package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.AdminDto.AdministrativeExpenseCategoryResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.AdministrativeExpense;
import com.lankacapital.server.entities.AdministrativeExpenseCategory;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.mappers.AdministrativeExpenseCategoryMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.AdministrativeExpenseCategoryRepository;
import com.lankacapital.server.services.AdministrativeExpenseCategoryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AdministrativeExpenseCategoryServiceImpl implements AdministrativeExpenseCategoryService {

    private AdministrativeExpenseCategoryRepository administrativeExpenseCategoryRepository;
    private EmployeeRepository employeeRepository;

    @Override
    public List<AdministrativeExpenseCategoryResponseDto> getAllCategories() {

        return administrativeExpenseCategoryRepository.findAll()
                .stream().map(AdministrativeExpenseCategoryMapper::mapToAdministrativeExpenseCategoryResponseDto)
                .toList();
    }

    @Override
    public Integer createNewCategory(String categoryName, String username) {
        if(administrativeExpenseCategoryRepository.existsByCategoryName(categoryName)){
            throw new ResourceExistException("Category already exists");
        }
        AdministrativeExpenseCategory newCategory = new AdministrativeExpenseCategory();

        newCategory.setCategoryName(categoryName);
        newCategory.setCreatedEmployee(employeeRepository.findByEmail(username));

        return administrativeExpenseCategoryRepository.save(newCategory).getId();
    }
}

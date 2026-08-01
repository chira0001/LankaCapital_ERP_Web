package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.AdminDto.PettyCashCategoryResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.PettyCash;
import com.lankacapital.server.entities.PettyCashCategory;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.mappers.PettyCashCategoryMapper;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.PettyCashCategoryRepository;
import com.lankacapital.server.services.PettyCashCategoryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PettyCashCategoryServiceImpl implements PettyCashCategoryService {

    private PettyCashCategoryRepository pettyCashCategoryRepository;
    private EmployeeRepository employeeRepository;

    @Override
    public List<PettyCashCategoryResponseDto> getAllCategories() {

        return pettyCashCategoryRepository.findAll()
                .stream().map(PettyCashCategoryMapper::mapToPettyCashCategoryResponseDto)
                .toList();
    }

    @Override
    public Integer createNewCategory(String categoryName, String username) {
        if(pettyCashCategoryRepository.existsByCategoryName(categoryName)){
            throw new ResourceExistException("Category already exists");
        }
        PettyCashCategory newCategory = new PettyCashCategory();

        newCategory.setCategoryName(categoryName);
        newCategory.setCreatedEmployee(employeeRepository.findByEmail(username));

        return pettyCashCategoryRepository.save(newCategory).getId();
    }
}

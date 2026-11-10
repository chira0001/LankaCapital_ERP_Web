package com.lankacapital.server.services;

import com.lankacapital.server.dtos.AdminDto.AdministrativeExpenseCategoryResponseDto;
import com.lankacapital.server.entities.AdministrativeExpenseCategory;

import java.util.List;

public interface AdministrativeExpenseCategoryService {
    List<AdministrativeExpenseCategoryResponseDto> getAllCategories();
    Integer createNewCategory(String categoryName, String username);
}

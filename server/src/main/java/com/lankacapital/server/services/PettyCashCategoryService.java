package com.lankacapital.server.services;

import com.lankacapital.server.dtos.AdminDto.PettyCashCategoryResponseDto;
import com.lankacapital.server.entities.PettyCashCategory;

import java.util.List;

public interface PettyCashCategoryService {
    List<PettyCashCategoryResponseDto> getAllCategories();
    Integer createNewCategory(String categoryName, String username);
}

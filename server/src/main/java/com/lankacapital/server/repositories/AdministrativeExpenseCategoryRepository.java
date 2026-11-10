package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.AdministrativeExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministrativeExpenseCategoryRepository extends JpaRepository<AdministrativeExpenseCategory, Integer> {

    boolean existsByCategoryName(String name);

}

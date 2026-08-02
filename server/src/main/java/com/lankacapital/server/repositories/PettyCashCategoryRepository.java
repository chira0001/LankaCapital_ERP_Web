package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.PettyCashCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PettyCashCategoryRepository extends JpaRepository<PettyCashCategory, Integer> {

    boolean existsByCategoryName(String name);

}

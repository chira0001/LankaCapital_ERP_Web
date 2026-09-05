package com.lankacapital.server.repositories.ReportsRepository;

import com.lankacapital.server.entities.reports.AssetsRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetsRegistryRepository extends JpaRepository<AssetsRegistry, Long> {

}

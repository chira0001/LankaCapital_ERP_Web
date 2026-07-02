package com.lankacapital.server.repositories;

import com.lankacapital.server.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    Boolean existsByRoleName(String roleName);
    Role findByRoleName(String roleName);
}

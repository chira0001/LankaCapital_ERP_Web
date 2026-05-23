package com.lankacapital.server.services;

import com.lankacapital.server.dtos.RoleRegisterDto;
import com.lankacapital.server.entities.Role;

import java.util.List;

public interface RoleService {

    Role addNewRole(RoleRegisterDto dto);
    List<Role> getAllRoles();
    Role getRoleByRoleName(RoleRegisterDto dto);

}

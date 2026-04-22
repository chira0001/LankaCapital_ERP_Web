package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.RoleRegisterDto;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.exceptions.ResourceExistException;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.repositories.RoleRepository;
import com.lankacapital.server.services.RoleService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;


    @Override
    public Role addNewRole(RoleRegisterDto dto) {
        if(roleRepository.existsByRoleName(dto.getRoleName())){
            throw new ResourceExistException("Role already exists : " + dto.getRoleName());
        }
        Role newRole = new Role();
        newRole.setRoleName(dto.getRoleName());
        return roleRepository.save(newRole);
    }

    @Override
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    public Role getRoleByRoleName(RoleRegisterDto dto) {
        Role role = roleRepository.findByRoleName(dto.getRoleName());
        if(role == null){
            throw new ResourceNotFoundException("Role not found with name : " + dto.getRoleName());
        }
        return role;
    }
}

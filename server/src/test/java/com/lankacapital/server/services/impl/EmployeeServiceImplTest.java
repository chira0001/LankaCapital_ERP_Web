package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.EmployeeResponseDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EmployeeServiceImplTest {
    @Test
    void deletingEmployeeSetsIntegerDeletedFlag() {
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        Employee employee = employee(2L, "FO");
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));

        EmployeeServiceImpl service = new EmployeeServiceImpl(
                employeeRepository,
                mock(RoleRepository.class),
                mock(PasswordEncoder.class),
                mock(AdminMenuPermissionService.class)
        );

        service.deleteEmployee(2L);

        assertEquals(1, employee.getDeleted());
        verify(employeeRepository).save(employee);
    }

    @Test
    void regularAdminCannotPromoteEmployeeToSuperAdmin() {
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        RoleRepository roleRepository = mock(RoleRepository.class);
        AdminMenuPermissionService adminMenuPermissionService = mock(AdminMenuPermissionService.class);
        Employee employee = employee(2L, "FO");
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(adminMenuPermissionService.isSuperAdmin("manager@email.com")).thenReturn(false);

        EmployeeServiceImpl service = new EmployeeServiceImpl(
                employeeRepository,
                roleRepository,
                mock(PasswordEncoder.class),
                adminMenuPermissionService
        );
        EmployeeResponseDto request = new EmployeeResponseDto();
        request.setRole("SUPERADMIN");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.updateEmployee("manager@email.com", 2L, request)
        );

        assertEquals(403, exception.getStatusCode().value());
        assertEquals("FO", employee.getRole().getRoleName());
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void superAdminCanPromoteEmployeeToSuperAdmin() {
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        RoleRepository roleRepository = mock(RoleRepository.class);
        AdminMenuPermissionService adminMenuPermissionService = mock(AdminMenuPermissionService.class);
        Employee employee = employee(2L, "FO");
        Role superAdminRole = new Role();
        superAdminRole.setRoleName("SUPERADMIN");
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(roleRepository.findByRoleName("SUPERADMIN")).thenReturn(superAdminRole);
        when(adminMenuPermissionService.isSuperAdmin("admin@email.com")).thenReturn(true);

        EmployeeServiceImpl service = new EmployeeServiceImpl(
                employeeRepository,
                roleRepository,
                mock(PasswordEncoder.class),
                adminMenuPermissionService
        );
        EmployeeResponseDto request = new EmployeeResponseDto();
        request.setRole("SUPERADMIN");

        service.updateEmployee("admin@email.com", 2L, request);

        assertEquals("SUPERADMIN", employee.getRole().getRoleName());
        verify(employeeRepository).save(employee);
    }

    private Employee employee(Long id, String roleName) {
        Role role = new Role();
        role.setRoleName(roleName);
        Employee employee = new Employee();
        employee.setId(id);
        employee.setRole(role);
        employee.setUpdateStatus(0L);
        return employee;
    }
}

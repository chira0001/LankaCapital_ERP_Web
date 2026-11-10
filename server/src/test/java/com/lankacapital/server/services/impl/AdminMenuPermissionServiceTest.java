package com.lankacapital.server.services.impl;

import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Role;
import com.lankacapital.server.repositories.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminMenuPermissionServiceTest {
    @Test
    void superAdminGetsEveryMainMenuPermission() {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        when(repository.findByEmail("admin@email.com")).thenReturn(admin(1L, "admin@email.com"));

        AdminMenuPermissionService service = new AdminMenuPermissionService(repository, "admin@email.com");

        var access = service.getCurrentAccess("admin@email.com");

        assertTrue(access.superAdmin());
        assertEquals(AdminMenuPermissionService.MENU_IDS, access.permissions());
    }

    @Test
    void unassignedAdminGetsNoMainMenuPermissions() {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        when(repository.findByEmail("manager@email.com")).thenReturn(admin(2L, "manager@email.com"));

        AdminMenuPermissionService service = new AdminMenuPermissionService(repository, "admin@email.com");

        var access = service.getCurrentAccess("manager@email.com");

        assertTrue(!access.superAdmin());
        assertEquals(List.of(), access.permissions());
    }

    @Test
    void onlySuperAdminCanAssignPermissionsToAnotherAdmin() {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        Employee target = admin(2L, "manager@email.com");
        when(repository.findByEmail("admin@email.com")).thenReturn(admin(1L, "admin@email.com"));
        when(repository.findByEmail("manager@email.com")).thenReturn(target);
        when(repository.findById(2L)).thenReturn(Optional.of(target));
        when(repository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));
        AdminMenuPermissionService service = new AdminMenuPermissionService(repository, "admin@email.com");

        assertThrows(AccessDeniedException.class,
                () -> service.updatePermissions("manager@email.com", 2L, List.of("users")));
        verify(repository, never()).save(any(Employee.class));

        List<String> assigned = service.updatePermissions("admin@email.com", 2L, List.of("users", "salary"));

        assertEquals(List.of("users", "salary"), assigned);
        assertEquals("users,salary", target.getAdminMenuPermissions());
    }

    private Employee admin(Long id, String email) {
        Role role = new Role();
        role.setRoleName("ADMIN");
        Employee employee = new Employee();
        employee.setId(id);
        employee.setEmail(email);
        employee.setRole(role);
        return employee;
    }
}
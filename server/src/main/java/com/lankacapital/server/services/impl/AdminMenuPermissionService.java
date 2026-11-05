package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.AdminMenuAccessDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class AdminMenuPermissionService {
    public static final List<String> MENU_IDS = List.of(
            "dashboard",
            "loan-applications",
            "loan-summary",
            "admin-exp",
            "financials",
            "customers",
            "users",
            "salary",
            "officers",
            "settings"
    );

    private final EmployeeRepository employeeRepository;
    private final String superAdminEmail;

    public AdminMenuPermissionService(
            EmployeeRepository employeeRepository,
            @Value("${app.super-admin-email:admin@email.com}") String superAdminEmail
    ) {
        this.employeeRepository = employeeRepository;
        this.superAdminEmail = superAdminEmail;
    }

    @Transactional(readOnly = true)
    public AdminMenuAccessDto getCurrentAccess(String username) {
        Employee employee = getAdmin(username);
        boolean superAdmin = isSuperAdmin(employee.getEmail());
        return new AdminMenuAccessDto(
                superAdmin,
                superAdmin ? MENU_IDS : readPermissions(employee.getAdminMenuPermissions())
        );
    }

    @Transactional
    public List<String> updatePermissions(String actorUsername, Long employeeId, List<String> requestedPermissions) {
        requireSuperAdmin(actorUsername);
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        if (employee.getRole() == null || !"ADMIN".equalsIgnoreCase(employee.getRole().getRoleName())
                || isSuperAdmin(employee.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu access can only be assigned to other admins");
        }

        List<String> permissions = validatePermissions(requestedPermissions);
        employee.setAdminMenuPermissions(String.join(",", permissions));
        employeeRepository.save(employee);
        return permissions;
    }

    public boolean isSuperAdmin(String username) {
        return username != null && username.trim().toLowerCase(Locale.ROOT)
                .equals(superAdminEmail.trim().toLowerCase(Locale.ROOT));
    }

    @Transactional(readOnly = true)
    public boolean hasAnyPermission(String username, List<String> requiredPermissions) {
        if (requiredPermissions.isEmpty()) return true;
        return getCurrentAccess(username).permissions().stream().anyMatch(requiredPermissions::contains);
    }

    private Employee getAdmin(String username) {
        Employee employee = employeeRepository.findByEmail(username);
        if (employee == null || employee.getRole() == null
                || !"ADMIN".equalsIgnoreCase(employee.getRole().getRoleName())) {
            throw new AccessDeniedException("Admin access required");
        }
        return employee;
    }

    private void requireSuperAdmin(String username) {
        Employee actor = getAdmin(username);
        if (!isSuperAdmin(actor.getEmail())) {
            throw new AccessDeniedException("Only the super admin can assign menu access");
        }
    }

    private List<String> readPermissions(String storedPermissions) {
        if (storedPermissions == null) return List.of();
        if (storedPermissions.isBlank()) return List.of();
        return validatePermissions(List.of(storedPermissions.split(",")));
    }

    private List<String> validatePermissions(List<String> requestedPermissions) {
        Set<String> requested = requestedPermissions == null
                ? Set.of()
                : new LinkedHashSet<>(requestedPermissions);
        if (!MENU_IDS.containsAll(requested)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown admin menu permission");
        }
        return MENU_IDS.stream().filter(requested::contains).toList();
    }
}
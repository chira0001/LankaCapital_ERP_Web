package com.lankacapital.server.config;

import com.lankacapital.server.services.impl.AdminMenuPermissionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminMenuPermissionFilter extends OncePerRequestFilter {
    private static final String ADMIN_API_PREFIX = "/api/v1/admin";
    private final AdminMenuPermissionService permissionService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getServletPath();
        if (!path.startsWith(ADMIN_API_PREFIX + "/")) {
            filterChain.doFilter(request, response);
            return;
        }

        List<String> requiredPermissions = requiredPermissions(path);
        if (requiredPermissions == null) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "No admin menu permission is assigned to this endpoint");
            return;
        }
        if (requiredPermissions.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !permissionService.hasAnyPermission(authentication.getName(), requiredPermissions)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Admin menu access denied");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private List<String> requiredPermissions(String path) {
        String endpoint = path.substring(ADMIN_API_PREFIX.length());
        if (endpoint.equals("/menu-permissions")
                || endpoint.startsWith("/employees/profile")) return List.of();
        if (endpoint.startsWith("/employees") || endpoint.equals("/employee")
                || endpoint.equals("/role")) return List.of("users");
        if (endpoint.startsWith("/salary-meta-data")) return List.of("salary", "settings");
        if (endpoint.equals("/salary") || endpoint.equals("/salary/approve")) return List.of("salary");
        if (endpoint.startsWith("/loans")) return List.of("loan-applications", "customers");
        if (endpoint.startsWith("/loan-summary")) return List.of("loan-summary");
        if (endpoint.startsWith("/administrative-expenses")
                || endpoint.startsWith("/administrative-expense-categories")) return List.of("admin-exp");
        if (endpoint.startsWith("/customers")) return List.of("customers");
        if (endpoint.startsWith("/financial-dashboard")) return List.of("dashboard");
        if (endpoint.startsWith("/dailyCollections")) return List.of("officers");
        if (endpoint.startsWith("/assets") || endpoint.startsWith("/reports")
                || endpoint.startsWith("/trialBalance") || endpoint.startsWith("/equityChange")
                || endpoint.startsWith("/cashFlow") || endpoint.startsWith("/financialNotes")
                || endpoint.startsWith("/shares") || endpoint.startsWith("/incomeTax")) {
            return List.of("financials");
        }
        if (endpoint.startsWith("/database")) return List.of("settings");
        return null;
    }
}
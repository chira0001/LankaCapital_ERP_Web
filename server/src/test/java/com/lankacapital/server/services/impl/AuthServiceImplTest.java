package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.SignInRequest;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.services.JWTService;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {
    @Test
    void signInRejectsDeletedEmployeeBeforeAuthenticating() {
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        Employee employee = new Employee();
        employee.setDeleted(1);
        when(employeeRepository.findByEmail("disabled@email.com")).thenReturn(employee);
        AuthServiceImpl service = new AuthServiceImpl(
                employeeRepository,
                mock(PasswordEncoder.class),
                authenticationManager,
                mock(JWTService.class)
        );
        SignInRequest request = new SignInRequest();
        request.setUsername("disabled@email.com");
        request.setPassword("password");

        DisabledException exception = assertThrows(
                DisabledException.class,
                () -> service.signIn(request)
        );

        assertEquals("User has been disabled", exception.getMessage());
        verify(authenticationManager, never()).authenticate(org.mockito.ArgumentMatchers.any());
    }
}

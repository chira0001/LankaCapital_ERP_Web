package com.lankacapital.server.services.impl;

import com.lankacapital.server.dtos.LoanUpdateDto;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.repositories.CustomerRepository;
import com.lankacapital.server.repositories.DailyCollectionRepository;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.LoanRepository;
import com.lankacapital.server.repositories.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoanServiceImplTest {

    @Test
    void regularAdminCannotChangeApprovedLoanStatus() {
        LoanRepository loanRepository = mock(LoanRepository.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        AdminMenuPermissionService adminMenuPermissionService = mock(AdminMenuPermissionService.class);
        Loan loan = new Loan();
        loan.setStatus(LoanStatus.APPROVED);
        when(loanRepository.findByFileNumber("LN-100")).thenReturn(Optional.of(loan));
        when(adminMenuPermissionService.isSuperAdmin("regular-admin@email.com")).thenReturn(false);

        LoanServiceImpl service = new LoanServiceImpl(
                loanRepository,
                mock(CustomerRepository.class),
                employeeRepository,
                mock(RoleRepository.class),
                mock(DailyCollectionRepository.class),
                adminMenuPermissionService
        );
        LoanUpdateDto update = new LoanUpdateDto();
        update.setStatus(LoanStatus.PENDING.name());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.updateLoan("regular-admin@email.com", update, "LN-100")
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertEquals(LoanStatus.APPROVED, loan.getStatus());
        verify(employeeRepository, never()).findByEmail("regular-admin@email.com");
        verify(loanRepository, never()).save(any(Loan.class));
    }

    @Test
    void regularAdminCanApprovePendingLoan() {
        assertRegularAdminCanReviewPendingLoan(LoanStatus.APPROVED);
    }

    @Test
    void regularAdminCanRejectPendingLoan() {
        assertRegularAdminCanReviewPendingLoan(LoanStatus.REJECTED);
    }

    @Test
    void regularAdminCanUpdateApprovedLoanDetailsWithoutChangingStatus() {
        LoanRepository loanRepository = mock(LoanRepository.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        AdminMenuPermissionService adminMenuPermissionService = mock(AdminMenuPermissionService.class);
        Loan loan = approvedLoan();
        when(loanRepository.findByFileNumber("LN-100")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeeRepository.findByEmail("regular-admin@email.com")).thenReturn(new Employee());
        when(adminMenuPermissionService.isSuperAdmin("regular-admin@email.com")).thenReturn(false);

        LoanServiceImpl service = new LoanServiceImpl(
                loanRepository,
                mock(CustomerRepository.class),
                employeeRepository,
                mock(RoleRepository.class),
                mock(DailyCollectionRepository.class),
                adminMenuPermissionService
        );
        LoanUpdateDto update = loanUpdate(LoanStatus.APPROVED);
        update.setAmount(BigDecimal.valueOf(45_000));

        service.updateLoan("regular-admin@email.com", update, "LN-100");

        assertEquals(LoanStatus.APPROVED, loan.getStatus());
        assertEquals(BigDecimal.valueOf(45_000), loan.getAmount());
        verify(loanRepository).save(loan);
    }

    @Test
    void superAdminCanApprovePendingLoan() {
        LoanRepository loanRepository = mock(LoanRepository.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        AdminMenuPermissionService adminMenuPermissionService = mock(AdminMenuPermissionService.class);
        Loan loan = new Loan();
        loan.setStatus(LoanStatus.PENDING);
        loan.setInstallment(1);
        loan.setAmount(BigDecimal.valueOf(30_000));
        Employee superAdmin = new Employee();
        when(loanRepository.findByFileNumber("LN-100")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeeRepository.findByEmail("admin@email.com")).thenReturn(superAdmin);
        when(adminMenuPermissionService.isSuperAdmin("admin@email.com")).thenReturn(true);

        LoanServiceImpl service = new LoanServiceImpl(
                loanRepository,
                mock(CustomerRepository.class),
                employeeRepository,
                mock(RoleRepository.class),
                mock(DailyCollectionRepository.class),
                adminMenuPermissionService
        );

        service.updateLoan("admin@email.com", loanUpdate(LoanStatus.APPROVED), "LN-100");

        assertEquals(LoanStatus.APPROVED, loan.getStatus());
        assertEquals(superAdmin, loan.getApprovedEmployee());
        verify(loanRepository).save(loan);
    }

    @Test
    void superAdminCanReturnApprovedLoanToPending() {
        LoanRepository loanRepository = mock(LoanRepository.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        AdminMenuPermissionService adminMenuPermissionService = mock(AdminMenuPermissionService.class);
        Loan loan = approvedLoan();
        Employee superAdmin = new Employee();
        when(loanRepository.findByFileNumber("LN-100")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeeRepository.findByEmail("admin@email.com")).thenReturn(superAdmin);
        when(adminMenuPermissionService.isSuperAdmin("admin@email.com")).thenReturn(true);

        LoanServiceImpl service = new LoanServiceImpl(
                loanRepository,
                mock(CustomerRepository.class),
                employeeRepository,
                mock(RoleRepository.class),
                mock(DailyCollectionRepository.class),
                adminMenuPermissionService
        );

        service.updateLoan("admin@email.com", loanUpdate(LoanStatus.PENDING), "LN-100");

        assertEquals(LoanStatus.PENDING, loan.getStatus());
        verify(loanRepository).save(loan);
    }

    private void assertRegularAdminCanReviewPendingLoan(LoanStatus status) {
        LoanRepository loanRepository = mock(LoanRepository.class);
        EmployeeRepository employeeRepository = mock(EmployeeRepository.class);
        AdminMenuPermissionService adminMenuPermissionService = mock(AdminMenuPermissionService.class);
        Loan loan = new Loan();
        loan.setStatus(LoanStatus.PENDING);
        loan.setInstallment(1);
        loan.setAmount(BigDecimal.valueOf(30_000));
        Employee admin = new Employee();
        when(loanRepository.findByFileNumber("LN-100")).thenReturn(Optional.of(loan));
        when(loanRepository.save(any(Loan.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(employeeRepository.findByEmail("regular-admin@email.com")).thenReturn(admin);
        when(adminMenuPermissionService.isSuperAdmin("regular-admin@email.com")).thenReturn(false);

        LoanServiceImpl service = new LoanServiceImpl(
                loanRepository,
                mock(CustomerRepository.class),
                employeeRepository,
                mock(RoleRepository.class),
                mock(DailyCollectionRepository.class),
                adminMenuPermissionService
        );

        service.updateLoan("regular-admin@email.com", loanUpdate(status), "LN-100");

        assertEquals(status, loan.getStatus());
        verify(loanRepository).save(loan);
    }

    private Loan approvedLoan() {
        Loan loan = new Loan();
        loan.setStatus(LoanStatus.APPROVED);
        loan.setInstallment(1);
        loan.setAmount(BigDecimal.valueOf(30_000));
        return loan;
    }

    private LoanUpdateDto loanUpdate(LoanStatus status) {
        LoanUpdateDto update = new LoanUpdateDto();
        update.setAmount(BigDecimal.valueOf(30_000));
        update.setDocumentCharge(BigDecimal.ZERO);
        update.setInterestRate(20.0);
        update.setInstallment(1);
        update.setStatus(status.name());
        return update;
    }
}

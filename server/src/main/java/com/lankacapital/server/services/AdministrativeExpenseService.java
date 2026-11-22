package com.lankacapital.server.services;

import com.lankacapital.server.dtos.AdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdministrativeExpenseResponseDto;
import com.lankacapital.server.dtos.Common.PageResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface AdministrativeExpenseService {

    BigDecimal getApprovedAdministrativeExpenseTotal();
    AdministrativeExpenseResponseDto addAdministrativeExpense(AdministrativeExpenseDto administrativeExpenseDto, String username);
    AdministrativeExpenseResponseDto addAdministrativeExpenseByAdmin(AdministrativeExpenseDto administrativeExpenseDto, String username);
    List<AdministrativeExpenseResponseDto> getAdministrativeExpenseForEmployee(String username);

    //admin
    AdministrativeExpenseResponseDto approveAdministrativeExpense(Long id, String adminUsername);
    AdministrativeExpenseResponseDto rejectAdministrativeExpense(Long id, String adminUsername);
    List<AdministrativeExpenseResponseDto> getPendingRequests();

    PageResponse<AdministrativeExpenseResponseDto> getAllAdministrativeExpense(int page, String requester, LocalDate expenseDate);
    AdministrativeExpenseResponseDto updateAdministrativeExpense(String username,Long id, AdministrativeExpenseDto administrativeExpenseDto);
    AdministrativeExpenseResponseDto undoStatus(Long id, String adminUsername);
    void deleteApprovedAdministrativeExpense(Long id, String username);
}

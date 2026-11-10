package com.lankacapital.server.services;

import com.lankacapital.server.dtos.AdministrativeExpenseDto;
import com.lankacapital.server.dtos.AdministrativeExpenseResponseDto;

import java.math.BigDecimal;
import java.util.List;

public interface AdministrativeExpenseService {

    BigDecimal getApprovedAdministrativeExpenseTotal();
    AdministrativeExpenseResponseDto addAdministrativeExpense(AdministrativeExpenseDto administrativeExpenseDto, String username);
    List<AdministrativeExpenseResponseDto> getAdministrativeExpenseForEmployee(String username);

    //admin
    AdministrativeExpenseResponseDto approveAdministrativeExpense(Long id, String adminUsername);
    AdministrativeExpenseResponseDto rejectAdministrativeExpense(Long id, String adminUsername);
    List<AdministrativeExpenseResponseDto> getPendingRequests();

    List<AdministrativeExpenseResponseDto> getAllAdministrativeExpense();
    AdministrativeExpenseResponseDto updateAdministrativeExpense(String username,Long id, AdministrativeExpenseDto administrativeExpenseDto);
    AdministrativeExpenseResponseDto undoStatus(Long id, String adminUsername);
}

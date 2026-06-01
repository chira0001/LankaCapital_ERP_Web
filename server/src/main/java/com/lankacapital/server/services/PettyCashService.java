package com.lankacapital.server.services;

import com.lankacapital.server.dtos.PettyCashDto;
import com.lankacapital.server.dtos.PettyCashResponseDto;

import java.util.List;

public interface PettyCashService {

    PettyCashResponseDto addPettyCash(PettyCashDto pettyCashDto, String username);
    List<PettyCashResponseDto> getPettyCashForEmployee(String username);

    //admin
    PettyCashResponseDto approvePettyCash(Long id, String adminUsername);

    PettyCashResponseDto rejectPettyCash(Long id, String adminUsername);

    List<PettyCashResponseDto> getPendingRequests();

    List<PettyCashResponseDto> getAllPettyCash();
}

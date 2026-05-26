package com.lankacapital.server.services;

import com.lankacapital.server.dtos.PettyCashDto;
import com.lankacapital.server.dtos.PettyCashResponseDto;

import java.util.List;

public interface PettyCashService {

    PettyCashResponseDto addPettyCash(PettyCashDto pettyCashDto);
    List<PettyCashResponseDto> getPettyCashForEmployee(Long empId);
}
